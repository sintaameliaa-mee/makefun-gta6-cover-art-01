/**
 * sample.js — procedurally drawn sample scenes for Neon Vice Cover Studio.
 *
 * No real photos ship with the app: these two scenes are painted with canvas
 * paths alone, so the editor opens with photos loaded and the screenshots
 * never show a real person. One is a synthwave beach at sunset, the other a
 * neon city skyline at dusk.
 */

function paintSunsetSky(ctx, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.62);
  sky.addColorStop(0, '#1b0f3b');
  sky.addColorStop(0.38, '#6d1e5e');
  sky.addColorStop(0.62, '#e8446e');
  sky.addColorStop(0.82, '#ff8a3d');
  sky.addColorStop(1, '#ffd23e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.62);
}

function paintSlicedSun(ctx, cx, cy, radius) {
  ctx.save();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  // Slice the lower half with sky-coloured bars, synthwave style.
  ctx.fillStyle = '#ff8a3d';
  let y = cy + radius * 0.08;
  let barH = radius * 0.045;
  while (y < cy + radius) {
    ctx.fillRect(cx - radius, y, radius * 2, barH);
    y += barH * 2.6;
    barH *= 1.35;
  }
  ctx.restore();
}

function paintPalm(ctx, x, y, scale, lean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(lean);
  ctx.strokeStyle = '#150820';
  ctx.lineCap = 'round';
  // Curved trunk.
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -90, -6, -190);
  ctx.stroke();
  // Fronds fanning from the crown.
  ctx.lineWidth = 9;
  const crownX = -6;
  const crownY = -190;
  for (let i = 0; i < 7; i += 1) {
    const angle = Math.PI * (0.08 + (i / 6) * 0.84);
    const len = 95 + (i % 3) * 16;
    const tipX = crownX + Math.cos(angle) * len;
    const tipY = crownY - Math.abs(Math.sin(angle)) * len * 0.62 + 26;
    ctx.beginPath();
    ctx.moveTo(crownX, crownY);
    ctx.quadraticCurveTo(
      crownX + Math.cos(angle) * len * 0.55,
      crownY - Math.abs(Math.sin(angle)) * len * 0.75,
      tipX,
      tipY,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function paintBirds(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(20, 8, 32, 0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const birds = [
    [width * 0.22, height * 0.16, 14],
    [width * 0.3, height * 0.21, 10],
    [width * 0.68, height * 0.13, 12],
    [width * 0.76, height * 0.19, 9],
  ];
  birds.forEach(([x, y, s]) => {
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.7, x, y);
    ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.7, x + s, y);
    ctx.stroke();
  });
  ctx.restore();
}

/** Synthwave beach: sliced sun, ocean reflection, palm silhouettes. */
function paintBeachScene(ctx, width, height) {
  paintSunsetSky(ctx, width, height);
  const horizon = height * 0.62;
  paintSlicedSun(ctx, width * 0.5, horizon - height * 0.2, height * 0.21);
  paintBirds(ctx, width, height);

  // Ocean with a glittering sun path.
  const sea = ctx.createLinearGradient(0, horizon, 0, height);
  sea.addColorStop(0, '#3a1c5e');
  sea.addColorStop(1, '#120826');
  ctx.fillStyle = sea;
  ctx.fillRect(0, horizon, width, height - horizon);
  ctx.save();
  ctx.fillStyle = 'rgba(255, 210, 62, 0.5)';
  for (let i = 0; i < 26; i += 1) {
    const t = i / 26;
    const y = horizon + 6 + t * (height - horizon - 14);
    const w = width * (0.02 + t * 0.16);
    ctx.fillRect(width / 2 - w / 2 + (i % 2 === 0 ? 8 : -8), y, w, 2.5);
  }
  ctx.restore();

  // Sand foreground.
  ctx.fillStyle = '#241031';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.86);
  ctx.quadraticCurveTo(width * 0.5, height * 0.8, width, height * 0.88);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  paintPalm(ctx, width * 0.1, height * 0.99, height / 620, -0.1);
  paintPalm(ctx, width * 0.9, height * 0.99, height / 720, 0.12);
  paintPalm(ctx, width * 0.8, height * 0.94, height / 1100, -0.06);
}

function paintCitySky(ctx, width, height) {
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.7);
  sky.addColorStop(0, '#070716');
  sky.addColorStop(0.55, '#1c1040');
  sky.addColorStop(1, '#5b1e63');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.7);

  // Stars.
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  const stars = [
    [0.08, 0.06], [0.16, 0.14], [0.27, 0.05], [0.36, 0.12], [0.47, 0.07],
    [0.58, 0.13], [0.66, 0.05], [0.74, 0.11], [0.84, 0.06], [0.92, 0.15],
    [0.12, 0.22], [0.44, 0.2], [0.7, 0.2], [0.88, 0.24], [0.55, 0.22],
  ];
  stars.forEach(([fx, fy], i) => {
    const r = i % 3 === 0 ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.arc(width * fx, height * fy, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Crescent moon.
  ctx.save();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.14, height * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1040';
  ctx.beginPath();
  ctx.arc(width * 0.845, height * 0.125, height * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Neon city: lit skyline, glowing signs, wet-street reflections. */
function paintCityScene(ctx, width, height) {
  paintCitySky(ctx, width, height);
  const ground = height * 0.78;

  // Far skyline, hazy purple.
  ctx.fillStyle = '#2a1750';
  const far = [
    [0.0, 0.42, 0.09], [0.08, 0.3, 0.07], [0.16, 0.48, 0.1], [0.27, 0.36, 0.08],
    [0.36, 0.52, 0.11], [0.48, 0.34, 0.09], [0.58, 0.46, 0.08], [0.67, 0.32, 0.1],
    [0.78, 0.5, 0.09], [0.88, 0.38, 0.12],
  ];
  far.forEach(([fx, fh, fw]) => {
    ctx.fillRect(width * fx, ground - height * fh, width * fw, height * fh);
  });

  // Near towers, near-black, with lit windows.
  const near = [
    [0.03, 0.58, 0.12], [0.2, 0.66, 0.13], [0.4, 0.5, 0.11],
    [0.56, 0.7, 0.12], [0.73, 0.56, 0.13], [0.9, 0.62, 0.1],
  ];
  near.forEach(([fx, fh, fw], bi) => {
    const bx = width * fx;
    const by = ground - height * fh;
    const bw = width * fw;
    const bh = height * fh;
    ctx.fillStyle = '#0d0722';
    ctx.fillRect(bx, by, bw, bh);
    // Antenna on the tallest tower.
    if (bi === 3) {
      ctx.fillRect(bx + bw / 2 - 1, by - height * 0.06, 2, height * 0.06);
      ctx.fillStyle = '#ff2e88';
      ctx.beginPath();
      ctx.arc(bx + bw / 2, by - height * 0.06, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Windows.
    const cols = Math.floor(bw / 22);
    const rows = Math.floor(bh / 26);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if ((r * 7 + c * 5 + bi * 3) % 4 !== 0) continue;
        ctx.fillStyle = (r + c) % 3 === 0 ? '#ffd23e' : '#2ee6ff';
        ctx.globalAlpha = 0.55 + ((r * 3 + c) % 3) * 0.15;
        ctx.fillRect(bx + 8 + c * 22, by + 10 + r * 26, 10, 13);
      }
    }
    ctx.globalAlpha = 1;
  });

  // Neon signs.
  const signs = [
    { x: 0.2, y: 0.3, w: 0.13, h: 0.045, color: '#ff2e88', text: 'VICE' },
    { x: 0.56, y: 0.2, w: 0.12, h: 0.04, color: '#2ee6ff', text: 'NEON' },
    { x: 0.73, y: 0.38, w: 0.1, h: 0.04, color: '#ffd23e', text: 'HOTEL' },
  ];
  signs.forEach(({ x, y, w, h, color }) => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.fillRect(width * x, height * y, width * w, height * h);
    ctx.restore();
  });

  // Wet street with vertical light streaks.
  const street = ctx.createLinearGradient(0, ground, 0, height);
  street.addColorStop(0, '#160b30');
  street.addColorStop(1, '#05030d');
  ctx.fillStyle = street;
  ctx.fillRect(0, ground, width, height - ground);
  ctx.save();
  const streaks = [
    [0.14, '#ff2e88'], [0.26, '#ffd23e'], [0.45, '#2ee6ff'],
    [0.62, '#ff2e88'], [0.78, '#ffd23e'], [0.9, '#2ee6ff'],
  ];
  streaks.forEach(([fx, color]) => {
    const grad = ctx.createLinearGradient(0, ground, 0, height);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = grad;
    ctx.fillRect(width * fx, ground, width * 0.02, height - ground);
  });
  ctx.restore();
}

/**
 * Paint one sample scene onto a fresh canvas.
 * variant: 'beach' | 'city'.
 */
export function makeSampleScene(variant, width = 1200, height = 900) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (variant === 'city') {
    paintCityScene(ctx, width, height);
  } else {
    paintBeachScene(ctx, width, height);
  }
  return canvas;
}

/** Both sample scenes, ready to load into the editor's photo strip. */
export function sampleScenes() {
  return [
    { canvas: makeSampleScene('beach'), label: 'Sunset Beach (sample)' },
    { canvas: makeSampleScene('city'), label: 'Neon City (sample)' },
  ];
}
