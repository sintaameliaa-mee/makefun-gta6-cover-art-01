// Neon Sunset Cover Maker — editor UI.
// Wires the controls to the cover engine: photo upload, panel assignment,
// crop and position by dragging, layouts, grades, caption and PNG export.
// Every photo stays on the user's machine; nothing is ever uploaded.

/* global drawCover, renderCoverCanvas, panelRects, LAYOUTS, GRADES, EXPORT_SIZES */
/* global drawSamplePortrait, drawSampleSkyline */

(function () {
  'use strict';

  /** The editor state: photos, one panel slot per layout, caption and grade. */
  const state = {
    layout: 'triptych',
    grade: 'sunset',
    caption: 'SUNSET DRIVE',
    subcaption: 'NEON NIGHTS • 2026',
    captionPos: 'bottom',
    sizeKey: 'wide',
    photos: [],
    panels: [],
    selectedPanel: 0,
  };

  const $ = (id) => document.getElementById(id);
  const preview = $('preview');
  const pctx = preview.getContext('2d');
  let fontsReady = false;

  /** A fresh panel list for the current layout, keeping any assignments that still fit. */
  function resetPanels() {
    const count = LAYOUTS[state.layout].panels;
    const kept = state.panels.slice(0, count);
    while (kept.length < count) kept.push({ photo: 0, zoom: 1, dx: 0, dy: 0 });
    state.panels = kept;
    if (state.selectedPanel >= count) state.selectedPanel = 0;
  }

  /** The state the engine draws, with photos resolved to images. */
  function coverState() {
    return {
      layout: state.layout,
      grade: state.grade,
      caption: state.caption,
      subcaption: state.subcaption,
      captionPos: state.captionPos,
      photos: state.photos,
      panels: state.panels,
    };
  }

  /** Redraws the live preview at the chosen export aspect. */
  function renderPreview() {
    const size = EXPORT_SIZES[state.sizeKey];
    if (preview.width !== size.width || preview.height !== size.height) {
      preview.width = size.width;
      preview.height = size.height;
    }
    pctx.clearRect(0, 0, preview.width, preview.height);
    drawCover(pctx, preview.width, preview.height, coverState());
    renderPanelChips();
  }

  /** The panel strip: one chip per panel slot, showing its photo and zoom. */
  function renderPanelChips() {
    const strip = $('panelStrip');
    strip.innerHTML = '';
    const rects = panelRects(state.layout, 100, 100);
    rects.forEach((rect, i) => {
      const panel = state.panels[i];
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'panel-chip' + (i === state.selectedPanel ? ' selected' : '');
      chip.textContent = 'Panel ' + (i + 1) + ' — ' + photoName(panel.photo) + ' · ' + Math.round((panel.zoom || 1) * 100) + '%';
      chip.addEventListener('click', () => {
        state.selectedPanel = i;
        syncZoomControl();
        renderPreview();
      });
      strip.appendChild(chip);
    });
    $('panelCount').textContent = rects.length + (rects.length === 1 ? ' panel' : ' panels');
  }

  /** A short name for a photo in the panel chips and photo list. */
  function photoName(index) {
    const photo = state.photos[index];
    if (!photo) return 'no photo';
    return photo.dataset.name || ('Photo ' + (index + 1));
  }

  /** The photo tray: thumbnails of every loaded photo, click to assign to the selected panel. */
  function renderPhotoTray() {
    const tray = $('photoTray');
    tray.innerHTML = '';
    if (state.photos.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'No photos yet — add your own, or try a sample below.';
      tray.appendChild(empty);
      return;
    }
    state.photos.forEach((photo, i) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'thumb';
      item.title = 'Click to put this photo in the selected panel';
      const img = document.createElement('img');
      // Canvases (drawn samples) have no src: snapshot them as a data URL.
      img.src = photo instanceof HTMLCanvasElement ? photo.toDataURL() : photo.src;
      img.alt = photoName(i);
      item.appendChild(img);
      const label = document.createElement('span');
      label.textContent = photoName(i);
      item.appendChild(label);
      item.addEventListener('click', () => {
        state.panels[state.selectedPanel].photo = i;
        renderPreview();
      });
      tray.appendChild(item);
    });
  }

  /** Adds an image (from a file or a generated canvas) to the photo tray. */
  function addPhoto(img, name) {
    img.dataset.name = name;
    state.photos.push(img);
    if (state.photos.length === 1) {
      state.panels.forEach((p) => { p.photo = 0; });
    }
    renderPhotoTray();
    renderPreview();
  }

  /** Reads chosen files as images, in order. */
  function handleFiles(files) {
    Array.from(files || []).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => addPhoto(img, file.name);
      img.src = url;
    });
  }

  /** Keeps the zoom slider and label in step with the selected panel. */
  function syncZoomControl() {
    const panel = state.panels[state.selectedPanel];
    $('zoom').value = Math.round((panel.zoom || 1) * 100);
    $('zoomLabel').textContent = Math.round((panel.zoom || 1) * 100) + '%';
  }

  /** Marks one button in a group active and clears the rest. */
  function markActive(groupId, value) {
    document.querySelectorAll('#' + groupId + ' button').forEach((b) => {
      b.classList.toggle('active', b.dataset.value === value);
    });
  }

  /** Builds a button group (layouts, grades, sizes) from a definition object. */
  function buildGroup(groupId, defs, current, onPick) {
    const group = $(groupId);
    group.innerHTML = '';
    Object.entries(defs).forEach(([key, def]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.value = key;
      b.textContent = def.label;
      b.classList.toggle('active', key === current);
      b.addEventListener('click', () => {
        onPick(key);
        markActive(groupId, key);
        renderPreview();
      });
      group.appendChild(b);
    });
  }

  /** Exports the cover at the chosen size and downloads it as a PNG. */
  function exportCover() {
    if (state.photos.length === 0) {
      $('status').textContent = 'Add a photo first — or try a sample photo.';
      return;
    }
    const canvas = renderCoverCanvas(coverState(), state.sizeKey);
    const size = EXPORT_SIZES[state.sizeKey];
    canvas.toBlob((blob) => {
      if (!blob) {
        $('status').textContent = 'Export failed in this browser — try again.';
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cover-' + size.width + 'x' + size.height + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      $('status').textContent = 'Exported ' + size.width + ' × ' + size.height + ' PNG — check your downloads.';
    }, 'image/png');
  }

  /** A data URL of the cover at a size, for headless checks and screenshots. */
  function exportCoverDataUrl(sizeKey) {
    const canvas = renderCoverCanvas(coverState(), sizeKey);
    return canvas.toDataURL('image/png');
  }

  // ---- Drag to pan the selected panel on the preview -----------------------
  let drag = null;
  preview.addEventListener('pointerdown', (e) => {
    const rect = preview.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rects = panelRects(state.layout, 1, 1);
    const hit = rects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (hit >= 0) {
      state.selectedPanel = hit;
      syncZoomControl();
    }
    drag = { x: e.clientX, y: e.clientY, dx: state.panels[state.selectedPanel].dx || 0, dy: state.panels[state.selectedPanel].dy || 0 };
    preview.setPointerCapture(e.pointerId);
    renderPreview();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = preview.getBoundingClientRect();
    const panel = state.panels[state.selectedPanel];
    panel.dx = drag.dx + (e.clientX - drag.x) / rect.width;
    panel.dy = drag.dy + (e.clientY - drag.y) / rect.height;
    panel.dx = Math.max(-1, Math.min(1, panel.dx));
    panel.dy = Math.max(-1, Math.min(1, panel.dy));
    renderPreview();
  });
  preview.addEventListener('pointerup', () => { drag = null; });

  // ---- Controls -------------------------------------------------------------
  $('fileInput').addEventListener('change', (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  });
  $('dropZone').addEventListener('click', () => $('fileInput').click());
  $('dropZone').addEventListener('dragover', (e) => { e.preventDefault(); $('dropZone').classList.add('over'); });
  $('dropZone').addEventListener('dragleave', () => $('dropZone').classList.remove('over'));
  $('dropZone').addEventListener('drop', (e) => {
    e.preventDefault();
    $('dropZone').classList.remove('over');
    handleFiles(e.dataTransfer.files);
  });

  $('samplePortrait').addEventListener('click', () => {
    const canvas = drawSamplePortrait(1080, 1350);
    canvas.dataset.name = 'Sample portrait';
    state.photos.push(canvas);
    if (state.photos.length === 1) state.panels.forEach((p) => { p.photo = 0; });
    renderPhotoTray();
    renderPreview();
    $('status').textContent = 'Sample portrait loaded — it is a drawn illustration, not a real photo.';
  });
  $('sampleSkyline').addEventListener('click', () => {
    const canvas = drawSampleSkyline(1920, 1080);
    canvas.dataset.name = 'Sample skyline';
    state.photos.push(canvas);
    renderPhotoTray();
    renderPreview();
    $('status').textContent = 'Sample skyline loaded — drawn illustration, free to use.';
  });
  $('fillAll').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    state.panels.forEach((p) => { p.photo = panel.photo; p.zoom = panel.zoom; p.dx = panel.dx; p.dy = panel.dy; });
    renderPreview();
    $('status').textContent = 'All panels now use the selected panel’s photo and crop.';
  });
  $('resetCrop').addEventListener('click', () => {
    const panel = state.panels[state.selectedPanel];
    panel.zoom = 1;
    panel.dx = 0;
    panel.dy = 0;
    syncZoomControl();
    renderPreview();
  });
  $('zoom').addEventListener('input', () => {
    const panel = state.panels[state.selectedPanel];
    panel.zoom = parseInt($('zoom').value, 10) / 100;
    $('zoomLabel').textContent = $('zoom').value + '%';
    renderPreview();
  });
  $('caption').addEventListener('input', () => { state.caption = $('caption').value; renderPreview(); });
  $('subcaption').addEventListener('input', () => { state.subcaption = $('subcaption').value; renderPreview(); });
  $('captionPos').addEventListener('change', () => { state.captionPos = $('captionPos').value; renderPreview(); });
  $('exportBtn').addEventListener('click', exportCover);

  buildGroup('layoutGroup', LAYOUTS, state.layout, (key) => {
    state.layout = key;
    resetPanels();
    syncZoomControl();
  });
  buildGroup('gradeGroup', GRADES, state.grade, (key) => { state.grade = key; });
  buildGroup('sizeGroup', EXPORT_SIZES, state.sizeKey, (key) => { state.sizeKey = key; });

  // ---- Start -----------------------------------------------------------------
  resetPanels();
  syncZoomControl();
  renderPhotoTray();
  // Wait for the Anton display font before the first paint, so the caption
  // lettering renders in the right face from the start.
  if (document.fonts && document.fonts.load) {
    document.fonts.load('80px Anton').then(() => {
      fontsReady = true;
      renderPreview();
    }).catch(() => renderPreview());
    document.fonts.ready.then(() => { if (!fontsReady) renderPreview(); });
  }
  renderPreview();

  /** A small handle for automated checks: state, preview and PNG export. */
  window.coverApp = {
    state,
    renderPreview,
    exportCoverDataUrl,
    addSamplePortrait: () => { $('samplePortrait').click(); },
    addSampleSkyline: () => { $('sampleSkyline').click(); },
  };
})();
