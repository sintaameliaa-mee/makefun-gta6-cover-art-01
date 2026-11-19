// Procedural sample photos for Neon Sunset Cover Maker.
// Both are drawn from scratch on canvas — flat illustration, no real person,
// no borrowed artwork — so screenshots can show the app with a photo loaded.

/** A stylised sunset portrait: skyline, sun and a person silhouette with neon rim light. */
function drawSamplePortrait(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  // Sunset sky.
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#1b0b3b');
  sky.addColorStop(0.45, '#7b2d8b');
  sky.addColorStop(0.72, '#ff5e62');
  sky.addColorStop(1, '#ffb347');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  // Sun with glow.
  const sx = width * 0.68;
  const sy = height * 0.34;
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, width * 0.5);
  glow.addColorStop(0, 'rgba(255,214,120,0.95)');
  glow.addColorStop(0.25, 'rgba(255,170,90,0.55)');
  glow.addColorStop(1, 'rgba(255,170,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(sx, sy, width * 0.13, 0, Math.PI * 2);
  ctx.fill();
  // Distant skyline.
  ctx.fillStyle = 'rgba(43,16,85,0.75)';
  const tops = [0.62, 0.55, 0.66, 0.58, 0.64, 0.52, 0.68, 0.6, 0.63, 0.56];
  let x = 0;
  const step = width / tops.length;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.78);
  tops.forEach((t, i) => {
    ctx.lineTo(x, height * t);
    ctx.lineTo(x + step * 0.7, height * t);
    ctx.lineTo(x + step * 0.7, height * 0.78);
    x += step;
  });
  ctx.lineTo(width, height * 0.78);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  // Ocean strip with sun reflection.
  const sea = ctx.createLinearGradient(0, height * 0.78, 0, height);
  sea.addColorStop(0, '#ff8c42');
  sea.addColorStop(1, '#2b1055');
  ctx.fillStyle = sea;
  ctx.fillRect(0, height * 0.78, width, height * 0.22);
  ctx.fillStyle = 'rgba(255,233,168,0.5)';
  for (let i = 0; i < 9; i++) {
    const rw = width * (0.05 + i * 0.012);
    ctx.fillRect(sx - rw / 2, height * (0.8 + i * 0.022), rw, 3);
  }
  // Person silhouette: head, hair, shoulders.
  const cx = width * 0.38;
  const cy = height * 0.52;
  const headR = width * 0.11;
  ctx.fillStyle = '#14082b';
  ctx.beginPath();
  ctx.arc(cx, cy, headR, 0, Math.PI * 2);
  ctx.fill();
  // Hair sweep.
  ctx.beginPath();
  ctx.moveTo(cx - headR * 1.05, cy - headR * 0.2);
  ctx.quadraticCurveTo(cx - headR * 0.4, cy - headR * 1.7, cx + headR * 0.7, cy - headR * 1.05);
  ctx.quadraticCurveTo(cx + headR * 1.15, cy - headR * 0.1, cx + headR * 0.9, cy + headR * 0.35);
  ctx.quadraticCurveTo(cx + headR * 0.4, cy - headR * 0.35, cx - headR * 0.35, cy - headR * 0.25);
  ctx.closePath();
  ctx.fill();
  // Neck and shoulders.
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.45, cy + headR * 0.8);
  ctx.quadraticCurveTo(cx - headR * 0.4, cy + headR * 1.5, cx - headR * 2.1, height);
  ctx.lineTo(cx + headR * 2.1, height);
  ctx.quadraticCurveTo(cx + headR * 0.4, cy + headR * 1.5, cx + headR * 0.45, cy + headR * 0.8);
  ctx.closePath();
  ctx.fill();
  // Neon rim light on the sun side.
  ctx.strokeStyle = 'rgba(255,214,120,0.95)';
  ctx.lineWidth = Math.max(3, width * 0.008);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, headR, -Math.PI * 0.45, Math.PI * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + headR * 0.45, cy + headR * 0.85);
  ctx.quadraticCurveTo(cx + headR * 0.5, cy + headR * 1.5, cx + headR * 1.9, height * 0.995);
  ctx.stroke();
  // Jacket collar accent.
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(4, width * 0.01);
  ctx.beginPath();
  ctx.moveTo(cx - headR * 0.7, height * 0.92);
  ctx.lineTo(cx, height * 0.82);
  ctx.lineTo(cx + headR * 0.7, height * 0.92);
  ctx.stroke();
  return canvas;
}

/** A neon boulevard skyline: towers, palm silhouettes and a gradient dusk sky. */
function drawSampleSkyline(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#0f0524');
  sky.addColorStop(0.5, '#4c1d95');
  sky.addColorStop(0.8, '#db2777');
  sky.addColorStop(1, '#fb923c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  // Stars.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const stars = [[0.12, 0.1], [0.3, 0.06], [0.52, 0.14], [0.7, 0.07], [0.88, 0.16], [0.2, 0.22], [0.62, 0.26], [0.94, 0.05]];
  stars.forEach(([fx, fy]) => {
    ctx.beginPath();
    ctx.arc(width * fx, height * fy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  // Moon.
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.18, width * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(254,243,199,0.25)';
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.18, width * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Towers with lit windows.
  const towers = [
    [0.02, 0.55, 0.1, 0.45], [0.14, 0.42, 0.12, 0.58], [0.28, 0.5, 0.09, 0.5],
    [0.39, 0.36, 0.13, 0.64], [0.54, 0.48, 0.1, 0.52], [0.66, 0.4, 0.12, 0.6],
    [0.8, 0.54, 0.09, 0.46], [0.91, 0.46, 0.09, 0.54],
  ];
  towers.forEach(([fx, fy, fw, fh], ti) => {
    ctx.fillStyle = '#150829';
    ctx.fillRect(width * fx, height * fy, width * fw, height * fh);
    ctx.fillStyle = 'rgba(255,209,102,0.9)';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r * 3 + c + ti) % 3 === 0) continue;
        ctx.fillRect(width * (fx + 0.015 + c * fw * 0.3), height * (fy + 0.04 + r * fh * 0.14), width * 0.014, height * 0.02);
      }
    }
  });
  // Wet boulevard reflection.
  const road = ctx.createLinearGradient(0, height * 0.86, 0, height);
  road.addColorStop(0, '#3b0764');
  road.addColorStop(1, '#12041f');
  ctx.fillStyle = road;
  ctx.fillRect(0, height * 0.86, width, height * 0.14);
  ctx.strokeStyle = 'rgba(255,209,102,0.8)';
  ctx.lineWidth = 3;
  ctx.setLineDash([26, 22]);
  ctx.beginPath();
  ctx.moveTo(0, height * 0.93);
  ctx.lineTo(width, height * 0.93);
  ctx.stroke();
  ctx.setLineDash([]);
  return canvas;
}
