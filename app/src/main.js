/**
 * main.js — UI wiring for Neon Vice Cover Studio.
 *
 * Holds the editor state (photos, panel assignments, crops, layout, grade,
 * caption, size), renders the live preview through cover.js, and exports the
 * finished cover as a PNG. Everything runs locally: photos are read with
 * FileReader or object URLs and never leave the machine.
 */
import { SIZES, GRADES, LAYOUTS, layoutPanels, drawCover } from './cover.js';
import { sampleScenes } from './sample.js';

const state = {
  photos: [], // { element, thumb, label }
  assignments: [0, 0, 0],
  crops: [
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
    { zoom: 1, ox: 0, oy: 0 },
  ],
  selectedPanel: 0,
  layout: 'trio',
  grade: 'sunset',
  sizeId: 'wide',
  title: 'NEON VICE',
  subtitle: 'SUMMER NIGHTS • 2026',
  captionPos: 'bottom',
};

const $ = (id) => document.getElementById(id);
const canvas = $('previewCanvas');
const ctx = canvas.getContext('2d');

function panelCount() {
  return LAYOUTS[state.layout].panels;
}

function syncPanelArrays() {
  const count = panelCount();
  while (state.assignments.length < count) state.assignments.push(0);
  while (state.crops.length < count) state.crops.push({ zoom: 1, ox: 0, oy: 0 });
  state.assignments.length = count;
  state.crops.length = count;
  if (state.selectedPanel >= count) state.selectedPanel = 0;
}

function currentCrop() {
  return state.crops[state.selectedPanel];
}

function render() {
  const size = SIZES[state.sizeId];
  if (canvas.width !== size.width || canvas.height !== size.height) {
    canvas.width = size.width;
    canvas.height = size.height;
  }
  drawCover(ctx, size.width, size.height, {
    photos: state.photos.map((p) => p.element),
    assignments: state.assignments,
    crops: state.crops,
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    captionPos: state.captionPos,
  });
  $('previewSize').textContent =
    `${size.label} · ${LAYOUTS[state.layout].label} · ${GRADES[state.grade].label}`;
  $('exportHint').textContent = `Exports the cover at ${size.label}.`;
  renderPanelChips();
  renderSliders();
}

function renderPanelChips() {
  const chips = $('panelChips');
  chips.innerHTML = '';
  for (let i = 0; i < panelCount(); i += 1) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'panel-chip';
    chip.textContent = `Panel ${i + 1}`;
    chip.setAttribute('aria-pressed', String(i === state.selectedPanel));
    chip.addEventListener('click', () => {
      state.selectedPanel = i;
      render();
    });
    chips.appendChild(chip);
  }
}

function renderSliders() {
  const crop = currentCrop();
  $('zoomSlider').value = String(crop.zoom);
  $('offsetXSlider').value = String(crop.ox);
  $('offsetYSlider').value = String(crop.oy);
  $('zoomValue').textContent = `${crop.zoom.toFixed(2)}×`;
  $('offsetXValue').textContent = crop.ox.toFixed(2);
  $('offsetYValue').textContent = crop.oy.toFixed(2);
}

function renderPhotoStrip() {
  const strip = $('photoStrip');
  strip.innerHTML = '';
  state.photos.forEach((photo, index) => {
    const thumb = document.createElement('img');
    thumb.className = 'photo-thumb';
    thumb.src = photo.thumb;
    thumb.alt = photo.label;
    thumb.title = `${photo.label} — click to fill the selected panel`;
    if (state.assignments[state.selectedPanel] === index) {
      thumb.classList.add('active');
    }
    thumb.addEventListener('click', () => {
      state.assignments[state.selectedPanel] = index;
      render();
      renderPhotoStrip();
    });
    strip.appendChild(thumb);
  });
}

function addPhoto(element, thumb, label) {
  state.photos.push({ element, thumb, label });
  renderPhotoStrip();
  render();
}

function loadSamplePhotos() {
  sampleScenes().forEach(({ canvas: scene, label }) => {
    addPhoto(scene, scene.toDataURL('image/jpeg', 0.82), label);
  });
  // Spread the samples across the panels for a varied first cover.
  state.assignments = state.assignments.map((_, i) => i % state.photos.length);
  render();
  renderPhotoStrip();
}

function loadFilePhoto(file) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const image = new Image();
    image.addEventListener('load', () => {
      addPhoto(image, reader.result, file.name);
    });
    image.src = reader.result;
  });
  reader.readAsDataURL(file);
}

function wireChoiceButtons(attribute, onPick) {
  document.querySelectorAll(`[data-${attribute}]`).forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll(`[data-${attribute}]`).forEach((other) => {
        other.setAttribute('aria-pressed', 'false');
      });
      button.setAttribute('aria-pressed', 'true');
      // Read the value from the attribute, not dataset: dataset camelCases
      // hyphenated names, so data-caption-pos would read back undefined.
      onPick(button.getAttribute(`data-${attribute}`));
    });
  });
}

function exportPng() {
  const size = SIZES[state.sizeId];
  const offscreen = document.createElement('canvas');
  offscreen.width = size.width;
  offscreen.height = size.height;
  const offCtx = offscreen.getContext('2d');
  drawCover(offCtx, size.width, size.height, {
    photos: state.photos.map((p) => p.element),
    assignments: state.assignments,
    crops: state.crops,
    layout: state.layout,
    grade: state.grade,
    title: state.title,
    subtitle: state.subtitle,
    captionPos: state.captionPos,
  });
  offscreen.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neon-vice-cover-${state.sizeId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, 'image/png');
}

function wireEvents() {
  $('photoInput').addEventListener('change', (event) => {
    [...event.target.files].forEach(loadFilePhoto);
    event.target.value = '';
  });
  $('sampleButton').addEventListener('click', loadSamplePhotos);

  document.addEventListener('dragover', (event) => event.preventDefault());
  document.addEventListener('drop', (event) => {
    event.preventDefault();
    [...event.dataTransfer.files]
      .filter((file) => file.type.startsWith('image/'))
      .forEach(loadFilePhoto);
  });

  wireChoiceButtons('layout', (layout) => {
    state.layout = layout;
    syncPanelArrays();
    render();
  });
  wireChoiceButtons('grade', (grade) => {
    state.grade = grade;
    render();
  });
  wireChoiceButtons('size', (sizeId) => {
    state.sizeId = sizeId;
    render();
  });
  wireChoiceButtons('caption-pos', (pos) => {
    state.captionPos = pos;
    render();
  });

  $('titleInput').addEventListener('input', (event) => {
    state.title = event.target.value.toUpperCase();
    render();
  });
  $('subtitleInput').addEventListener('input', (event) => {
    state.subtitle = event.target.value.toUpperCase();
    render();
  });

  $('zoomSlider').addEventListener('input', (event) => {
    currentCrop().zoom = Number(event.target.value);
    render();
  });
  $('offsetXSlider').addEventListener('input', (event) => {
    currentCrop().ox = Number(event.target.value);
    render();
  });
  $('offsetYSlider').addEventListener('input', (event) => {
    currentCrop().oy = Number(event.target.value);
    render();
  });

  $('fillAllButton').addEventListener('click', () => {
    const photoIndex = state.assignments[state.selectedPanel];
    state.assignments = state.assignments.map(() => photoIndex);
    render();
  });

  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const size = SIZES[state.sizeId];
    const panels = layoutPanels(state.layout, size.width, size.height);
    const hit = panels.findIndex(
      (p) => x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height,
    );
    if (hit >= 0) {
      state.selectedPanel = hit;
      render();
      renderPhotoStrip();
    }
  });

  $('exportButton').addEventListener('click', exportPng);
}

async function init() {
  wireEvents();
  loadSamplePhotos();
  // Wait for the Anton face so the first render uses the real lettering.
  try {
    await document.fonts.load('100px Anton');
    await document.fonts.ready;
  } catch (_error) {
    // Fall back to the system sans if the font cannot load; the app still works.
  }
  render();
  window.__ready = true;
}

init();
