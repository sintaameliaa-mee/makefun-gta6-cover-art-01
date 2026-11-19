// Neon Sunset Cover Maker — cover render engine.
// Draws GTA 6-style multi-panel poster art onto any canvas: panel photos with
// crop and position, a sunset or neon colour grade, palm silhouettes, and bold
// Anton caption lettering. Pure canvas 2D, no network, no dependencies.

/** The poster layouts, each a list of panel rectangles in fractions of the canvas. */
const LAYOUTS = {
  hero: { label: 'Hero — one big photo', panels: 1 },
  split: { label: 'Split — two diagonal panels', panels: 2 },
  triptych: { label: 'Triptych — hero + two stacked', panels: 3 },
  quartet: { label: 'Quartet — four panels', panels: 4 },
};

/** The colour grades: sky tints applied over the photos. */
const GRADES = {
  sunset: { label: 'Sunset', top: '#ff9a3d', bottom: '#ff2e88', glow: '#ffd166' },
  neon: { label: 'Neon nights', top: '#22d3ee', bottom: '#e879f9', glow: '#f0abfc' },
  noir: { label: 'Noir teal', top: '#2dd4bf', bottom: '#0f766e', glow: '#99f6e4' },
  gold: { label: 'Golden hour', top: '#fbbf24', bottom: '#f97316', glow: '#fef08a' },
};

/** The export sizes: the common post sizes, width x height in pixels. */
const EXPORT_SIZES = {
  square: { label: 'Square 1080 × 1080', width: 1080, height: 1080 },
  portrait: { label: 'Portrait 1080 × 1350', width: 1080, height: 1350 },
  wide: { label: 'Wide 1920 × 1080', width: 1920, height: 1080 },
};

/** A deterministic pseudo-random stream, so a cover renders the same every time. */
function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Panel rectangles for a layout, in fractions of the canvas (x, y, w, h). */
function panelRects(layout, width, height) {
  if (layout === 'hero') return [{ x: 0, y: 0, w: width, h: height }];
  if (layout === 'split') {
    return [
      { x: 0, y: 0, w: width * 0.56, h: height, slant: 0.07 },
      { x: width * 0.5, y: 0, w: width * 0.5, h: height, slant: -0.07 },
    ];
  }
  if (layout === 'triptych') {
    return [
      { x: 0, y: 0, w: width * 0.62, h: height },
      { x: width * 0.62, y: 0, w: width * 0.38, h: height * 0.5 },
      { x: width * 0.62, y: height * 0.5, w: width * 0.38, h: height * 0.5 },
    ];
  }
  return [
    { x: 0, y: 0, w: width * 0.5, h: height * 0.5 },
    { x: width * 0.5, y: 0, w: width * 0.5, h: height * 0.5 },
    { x: 0, y: height * 0.5, w: width * 0.5, h: height * 0.5 },
    { x: width * 0.5, y: height * 0.5, w: width * 0.5, h: height * 0.5 },
  ];
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan offsets. */
function drawPhotoInPanel(ctx, photo, rect, panel) {
  const pw = rect.w;
  const ph = rect.h;
  const iw = photo.naturalWidth || photo.width;
  const ih = photo.naturalHeight || photo.height;
  if (!iw || !ih) return;
  const zoom = panel.zoom || 1;
  const scale = Math.max(pw / iw, ph / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  // Pan never exposes the sky behind the photo: clamp to the overhang.
  const maxDx = Math.max(0, (dw - pw) / 2) / pw;
  const maxDy = Math.max(0, (dh - ph) / 2) / ph;
  const ox = Math.max(-maxDx, Math.min(maxDx, panel.dx || 0));
  const oy = Math.max(-maxDy, Math.min(maxDy, panel.dy || 0));
  const dx = rect.x + (pw - dw) / 2 + ox * pw;
  const dy = rect.y + (ph - dh) / 2 + oy * ph;
  ctx.drawImage(photo, dx, dy, dw, dh);
}

/** Clips to a panel rect, applying its diagonal slant when it has one. */
function clipPanel(ctx, rect) {
  ctx.beginPath();
  if (rect.slant) {
    // One edge slants; the other stays vertical so the panel meets the canvas edge.
    const s = rect.slant * rect.h;
    if (s > 0) {
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y);
      ctx.lineTo(rect.x + rect.w - s, rect.y + rect.h);
      ctx.lineTo(rect.x, rect.y + rect.h);
    } else {
      ctx.moveTo(rect.x + s, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
      ctx.lineTo(rect.x, rect.y + rect.h);
    }
  } else {
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
  }
  ctx.closePath();
  ctx.clip();
}

/** A palm-tree silhouette: trunk plus seven drooping fronds. */
function drawPalm(ctx, x, y, size, lean, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.035);
  ctx.lineCap = 'round';
  // Trunk, leaning gently.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.06, -size * 0.55, size * 0.02, -size);
  ctx.stroke();
  // Fronds fanning from the crown.
  const topX = size * 0.02;
  const topY = -size;
  for (let i = 0; i < 7; i++) {
    const a = (-160 + i * 26) * (Math.PI / 180);
    const len = size * (0.42 + (i % 3) * 0.06);
    const cx = topX + Math.cos(a) * len * 0.6;
    const cy = topY + Math.sin(a) * len * 0.45 - size * 0.05;
    const ex = topX + Math.cos(a) * len;
    const ey = topY + Math.sin(a) * len + size * 0.16;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.lineWidth = Math.max(1.5, size * 0.02);
    ctx.stroke();
  }
  // Coconuts.
  ctx.beginPath();
  ctx.arc(topX - size * 0.03, topY + size * 0.03, size * 0.035, 0, Math.PI * 2);
  ctx.arc(topX + size * 0.04, topY + size * 0.04, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A low city skyline silhouette along the bottom of the canvas. */
function drawSkyline(ctx, width, height, color, seed) {
  const rand = seededRandom(seed);
  const base = height * 0.94;
  ctx.fillStyle = color;
  let x = 0;
  ctx.beginPath();
  ctx.moveTo(0, base);
  while (x < width) {
    const bw = width * (0.03 + rand() * 0.05);
    const bh = height * (0.03 + rand() * 0.09);
    ctx.lineTo(x, base - bh);
    ctx.lineTo(x + bw, base - bh);
    ctx.lineTo(x + bw, base);
    x += bw + width * 0.004;
  }
  ctx.lineTo(width, base);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
}

/** The sunset colour grade: warm sky tint, glow, vignette and a little grain. */
function applyGrade(ctx, width, height, grade) {
  const g = GRADES[grade] || GRADES.sunset;
  // Warm wash, stronger at the edges.
  const wash = ctx.createLinearGradient(0, 0, 0, height);
  wash.addColorStop(0, hexA(g.top, 0.22));
  wash.addColorStop(0.55, hexA(g.top, 0.05));
  wash.addColorStop(1, hexA(g.bottom, 0.28));
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);
  // Sun glow in the upper third.
  const gx = width * 0.78;
  const gy = height * 0.24;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, width * 0.42);
  glow.addColorStop(0, hexA(g.glow, 0.5));
  glow.addColorStop(1, hexA(g.glow, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  // Vignette.
  const vg = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.42,
    width / 2, height / 2, Math.max(width, height) * 0.75,
  );
  vg.addColorStop(0, 'rgba(10,4,24,0)');
  vg.addColorStop(1, 'rgba(10,4,24,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, width, height);
}

/** A hex colour with an alpha channel, as an rgba() string. */
function hexA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** The bold caption: uppercase Anton with a thick outline, gradient fill and shadow. */
function drawCaption(ctx, width, height, state) {
  const caption = (state.caption || '').trim().toUpperCase();
  const sub = (state.subcaption || '').trim().toUpperCase();
  if (!caption && !sub) return;
  const onTop = state.captionPos === 'top';
  const bandH = height * 0.2;
  const bandY = onTop ? 0 : height - bandH;
  // Caption band: dark gradient so white lettering always reads.
  const band = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
  if (onTop) {
    band.addColorStop(0, 'rgba(8,3,20,0.72)');
    band.addColorStop(1, 'rgba(8,3,20,0)');
  } else {
    band.addColorStop(0, 'rgba(8,3,20,0)');
    band.addColorStop(1, 'rgba(8,3,20,0.78)');
  }
  ctx.fillStyle = band;
  ctx.fillRect(0, bandY, width, bandH);

  ctx.save();
  // Caption geometry in pixels, tied to the short side so a wide cover
  // keeps its sub-caption on the canvas: caption centre, then the sub-caption
  // tucked under it with room to spare at the edge.
  let size = caption ? Math.min(width * 0.115, height * 0.2) : 0;
  const subSize = Math.max(13, Math.min(width, height) * 0.028);
  let cy;
  let subY;
  if (onTop) {
    cy = size * 0.62 + 10;
    subY = cy + size * 0.62 + subSize;
  } else if (sub) {
    subY = height - subSize * 0.9;
    cy = subY - subSize - size * 0.62;
  } else {
    cy = height - size * 0.62 - 8;
    subY = cy;
  }
  ctx.translate(width / 2, cy);
  ctx.rotate(-0.028);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (caption) {
    ctx.font = `${size}px Anton, "Arial Black", sans-serif`;
    // Shrink until the caption fits with side margins.
    while (ctx.measureText(caption).width > width * 0.92 && size > width * 0.03) {
      size *= 0.92;
      ctx.font = `${size}px Anton, "Arial Black", sans-serif`;
    }
    try { ctx.letterSpacing = `${Math.round(size * 0.02)}px`; } catch (e) { /* older canvas: no tracking */ }
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.06;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = '#160a2e';
    ctx.strokeText(caption, 0, 0);
    const fill = ctx.createLinearGradient(0, -size * 0.6, 0, size * 0.6);
    fill.addColorStop(0, '#ffffff');
    fill.addColorStop(0.55, '#ffe9a8');
    fill.addColorStop(1, '#ff7a3d');
    ctx.fillStyle = fill;
    ctx.fillText(caption, 0, 0);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (sub) {
    const subFontSize = Math.max(13, Math.min(width, height) * 0.028);
    ctx.font = `700 ${subFontSize}px "Arial Narrow", Arial, sans-serif`;
    try { ctx.letterSpacing = `${Math.round(subFontSize * 0.32)}px`; } catch (e) { /* older canvas */ }
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(sub, 0, subY - cy);
  }
  ctx.restore();
}

/**
 * Draws the whole cover onto ctx at the canvas size.
 * state: { layout, grade, caption, subcaption, captionPos, photos, panels }
 * photos: array of images/canvases. panels: one {photo, zoom, dx, dy} per slot.
 */
function drawCover(ctx, width, height, state) {
  const rects = panelRects(state.layout || 'hero', width, height);
  const panels = state.panels || [];
  const photos = state.photos || [];
  // Deep sunset sky behind everything, so gaps read as sky, not black.
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.5, '#7597de');
  sky.addColorStop(0.75, '#ff7e5f');
  sky.addColorStop(1, '#feb47b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  rects.forEach((rect, i) => {
    const panel = panels[i] || { photo: 0, zoom: 1, dx: 0, dy: 0 };
    const photo = photos[panel.photo];
    ctx.save();
    clipPanel(ctx, rect);
    if (photo) drawPhotoInPanel(ctx, photo, rect, panel);
    ctx.restore();
  });

  // Thin bright dividers between panels.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(2, width * 0.004);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = width * 0.006;
  rects.forEach((rect, i) => {
    if (i === 0) return;
    ctx.beginPath();
    if (rect.slant) {
      // The seam is the panel's slanted left edge.
      ctx.moveTo(rect.x + rect.slant * rect.h, rect.y);
      ctx.lineTo(rect.x, rect.y + rect.h);
    } else if (rect.y > 0 && rect.x > 0) {
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y);
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x, rect.y + rect.h);
    } else if (rect.y > 0) {
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x + rect.w, rect.y);
    } else {
      ctx.moveTo(rect.x, rect.y);
      ctx.lineTo(rect.x, rect.y + rect.h);
    }
    ctx.stroke();
  });
  ctx.restore();

  applyGrade(ctx, width, height, state.grade || 'sunset');
  drawSkyline(ctx, width, height, 'rgba(16,6,32,0.55)', 7);
  drawPalm(ctx, width * 0.04, height * 0.98, height * 0.34, -0.1, 'rgba(12,4,26,0.85)');
  drawPalm(ctx, width * 0.97, height * 0.99, height * 0.28, 0.12, 'rgba(12,4,26,0.8)');
  drawCaption(ctx, width, height, state);
}

/** Renders a cover into a fresh canvas at the requested export size. */
function renderCoverCanvas(state, sizeKey) {
  const size = EXPORT_SIZES[sizeKey] || EXPORT_SIZES.wide;
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  drawCover(canvas.getContext('2d'), size.width, size.height, state);
  return canvas;
}
