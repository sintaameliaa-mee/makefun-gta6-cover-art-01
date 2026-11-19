/**
 * cover.js — the cover renderer for Neon Vice Cover Studio.
 *
 * Pure canvas drawing: given a 2D context, a size, and a state object, it
 * paints a GTA-style multi-panel poster — photos in panels, a colour grade,
 * and bold Anton caption lettering. The same function renders the live
 * preview and the exported PNG, so what you see is what you get.
 */

// Export sizes, in pixels.
export const SIZES = {
  square: { width: 1080, height: 1080, label: '1080 × 1080' },
  portrait: { width: 1080, height: 1350, label: '1080 × 1350' },
  wide: { width: 1920, height: 1080, label: '1920 × 1080' },
};

// Colour grades. Each grade tints every panel with a two-stop overlay and
// sets the caption's ink, accent bar, and glow.
export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    overlayTop: 'rgba(255, 122, 46, 0.30)',
    overlayBottom: 'rgba(255, 46, 136, 0.34)',
    captionInk: '#ffffff',
    accent: '#ffb02e',
    glow: 'rgba(255, 122, 46, 0.55)',
  },
  neon: {
    label: 'Neon Nights',
    overlayTop: 'rgba(255, 46, 136, 0.32)',
    overlayBottom: 'rgba(46, 230, 255, 0.30)',
    captionInk: '#eafcff',
    accent: '#2ee6ff',
    glow: 'rgba(46, 230, 255, 0.55)',
  },
  noir: {
    label: 'Mono Noir',
    overlayTop: 'rgba(216, 216, 224, 0.10)',
    overlayBottom: 'rgba(46, 230, 255, 0.16)',
    captionInk: '#f5f5f8',
    accent: '#2ee6ff',
    glow: 'rgba(216, 216, 224, 0.4)',
  },
};

export const LAYOUTS = {
  trio: { label: 'Hero Trio', panels: 3 },
  quad: { label: 'Quad Grid', panels: 4 },
  hero: { label: 'Single Hero', panels: 1 },
};

/**
 * Panel rectangles for a layout, in canvas pixels. Panels are separated by a
 * dark gutter so the poster reads as distinct framed shots.
 */
export function layoutPanels(layoutId, width, height) {
  const gap = Math.max(6, Math.round(Math.min(width, height) * 0.014));
  if (layoutId === 'hero') {
    return [{ x: 0, y: 0, width, height }];
  }
  if (layoutId === 'quad') {
    const halfW = (width - gap) / 2;
    const halfH = (height - gap) / 2;
    return [
      { x: 0, y: 0, width: halfW, height: halfH },
      { x: halfW + gap, y: 0, width: halfW, height: halfH },
      { x: 0, y: halfH + gap, width: halfW, height: halfH },
      { x: halfW + gap, y: halfH + gap, width: halfW, height: halfH },
    ];
  }
  // Hero Trio: one tall panel on the left, two stacked panels on the right.
  const bigW = Math.round(width * 0.62);
  const smallW = width - bigW - gap;
  const halfH = (height - gap) / 2;
  return [
    { x: 0, y: 0, width: bigW, height },
    { x: bigW + gap, y: 0, width: smallW, height: halfH },
    { x: bigW + gap, y: halfH + gap, width: smallW, height: halfH },
  ];
}

/**
 * Draw an image into a rectangle with cover fit, then zoom and shift it.
 * crop = { zoom: 1..3, ox: -0.5..0.5, oy: -0.5..0.5 }; offsets are fractions
 * of the slack the zoom leaves, so 0 always means centred.
 */
export function drawPhotoCover(ctx, image, rect, crop) {
  const imgW = image.naturalWidth || image.width;
  const imgH = image.naturalHeight || image.height;
  const targetAspect = rect.width / rect.height;
  const imageAspect = imgW / imgH;
  let srcW;
  let srcH;
  if (imageAspect > targetAspect) {
    srcH = imgH;
    srcW = imgH * targetAspect;
  } else {
    srcW = imgW;
    srcH = imgW / targetAspect;
  }
  const zoom = Math.max(1, crop.zoom || 1);
  srcW /= zoom;
  srcH /= zoom;
  const slackX = imgW - srcW;
  const slackY = imgH - srcH;
  const srcX = slackX / 2 + (crop.ox || 0) * slackX;
  const srcY = slackY / 2 + (crop.oy || 0) * slackY;
  ctx.drawImage(image, srcX, srcY, srcW, srcH, rect.x, rect.y, rect.width, rect.height);
}

/** Wash a panel with the grade's two-stop colour overlay. */
export function applyGradeTint(ctx, rect, grade) {
  const gradient = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
  gradient.addColorStop(0, grade.overlayTop);
  gradient.addColorStop(1, grade.overlayBottom);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = gradient;
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

/** Shrink a font size until the text fits maxWidth. Returns the size used. */
export function fitText(ctx, text, maxWidth, startSize, fontFamily) {
  let size = startSize;
  ctx.font = `${size}px ${fontFamily}`;
  while (size > 12 && ctx.measureText(text).width > maxWidth) {
    size = Math.max(12, Math.floor(size * 0.94));
    ctx.font = `${size}px ${fontFamily}`;
  }
  return size;
}

function drawPosterFrame(ctx, width, height) {
  const inset = Math.max(8, Math.round(Math.min(width, height) * 0.016));
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = Math.max(2, Math.round(Math.min(width, height) * 0.004));
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  ctx.restore();
}

/**
 * Draw the caption block: an accent bar, the big title in Anton with a dark
 * outline and glow, and a letterspaced subtitle. A dark scrim behind it
 * keeps the lettering readable over any photo.
 */
export function drawCaption(ctx, width, height, title, subtitle, position, grade) {
  const pad = Math.round(width * 0.045);
  const blockH = Math.round(height * 0.26);
  const top = position === 'top' ? 0 : height - blockH;

  const scrim = ctx.createLinearGradient(0, top, 0, top + blockH);
  if (position === 'top') {
    scrim.addColorStop(0, 'rgba(8, 4, 20, 0.82)');
    scrim.addColorStop(1, 'rgba(8, 4, 20, 0)');
  } else {
    scrim.addColorStop(0, 'rgba(8, 4, 20, 0)');
    scrim.addColorStop(1, 'rgba(8, 4, 20, 0.82)');
  }
  ctx.save();
  ctx.fillStyle = scrim;
  ctx.fillRect(0, top, width, blockH);
  ctx.restore();

  const titleSize = fitText(
    ctx,
    title || ' ',
    width - pad * 2,
    Math.round(width * 0.115),
    'Anton, "Arial Black", sans-serif',
  );
  const titleY = position === 'top'
    ? top + pad + titleSize * 0.9
    : height - pad - Math.round(titleSize * 0.42);

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${titleSize}px Anton, "Arial Black", sans-serif`;
  ctx.lineJoin = 'round';
  ctx.shadowColor = grade.glow;
  ctx.shadowBlur = Math.round(titleSize * 0.25);
  ctx.strokeStyle = 'rgba(10, 4, 24, 0.9)';
  ctx.lineWidth = Math.max(3, Math.round(titleSize / 11));
  ctx.strokeText(title, pad, titleY);
  ctx.shadowBlur = 0;
  ctx.fillStyle = grade.captionInk;
  ctx.fillText(title, pad, titleY);
  ctx.restore();

  // Accent bar under (or over) the title.
  const barW = Math.round(width * 0.16);
  const barH = Math.max(4, Math.round(titleSize * 0.09));
  const barY = position === 'top' ? titleY + Math.round(titleSize * 0.16) : titleY - titleSize - Math.round(titleSize * 0.28);
  ctx.save();
  ctx.fillStyle = grade.accent;
  ctx.fillRect(pad, barY, barW, barH);
  ctx.restore();

  if (subtitle) {
    const subSize = Math.max(14, Math.round(titleSize * 0.24));
    ctx.save();
    ctx.font = `700 ${subSize}px "Segoe UI", system-ui, Arial, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(subSize * 0.32)}px`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const subY = position === 'top'
      ? barY + barH + subSize * 1.5
      : height - pad;
    ctx.fillText(subtitle, pad, subY);
    ctx.restore();
  }
}

/** Small credit line at the edge opposite the caption. */
function drawCreditLine(ctx, width, height, position) {
  const pad = Math.round(width * 0.045);
  const size = Math.max(11, Math.round(width * 0.011));
  ctx.save();
  ctx.font = `700 ${size}px "Segoe UI", system-ui, Arial, sans-serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(size * 0.3)}px`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  const y = position === 'top' ? height - pad * 0.7 : pad * 0.7 + size;
  ctx.fillText('NEON VICE  •  ORIGINAL COVER ART', pad, y);
  ctx.restore();
}

/**
 * Paint the whole cover.
 * state = {
 *   photos: Image[], assignments: number[] (photo index per panel),
 *   crops: [{zoom, ox, oy}] per panel, layout: 'trio'|'quad'|'hero',
 *   grade: key of GRADES, title: string, subtitle: string,
 *   captionPos: 'top'|'bottom'
 * }
 */
export function drawCover(ctx, width, height, state) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const panels = layoutPanels(state.layout, width, height);

  // Dark stage behind the gutters.
  ctx.save();
  ctx.fillStyle = '#0a0616';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  panels.forEach((rect, index) => {
    const photoIndex = state.assignments[index] ?? 0;
    const image = state.photos[photoIndex];
    const crop = state.crops[index] || { zoom: 1, ox: 0, oy: 0 };
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    if (image) {
      if (state.grade === 'noir') ctx.filter = 'grayscale(1) contrast(1.12)';
      drawPhotoCover(ctx, image, rect, crop);
      ctx.filter = 'none';
    } else {
      // Empty panel: a dusk gradient so the poster still reads.
      const empty = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
      empty.addColorStop(0, '#2a1845');
      empty.addColorStop(1, '#120a24');
      ctx.fillStyle = empty;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    applyGradeTint(ctx, rect, grade);
    // Soft diagonal light sweep across the panel.
    const sweep = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
    sweep.addColorStop(0, 'rgba(255, 255, 255, 0.10)');
    sweep.addColorStop(0.45, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sweep;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();

    // Thin bright edge around each panel.
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = Math.max(1, Math.round(Math.min(width, height) * 0.0015));
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  });

  drawCaption(ctx, width, height, state.title, state.subtitle, state.captionPos, grade);
  drawCreditLine(ctx, width, height, state.captionPos);
  drawPosterFrame(ctx, width, height);
}
