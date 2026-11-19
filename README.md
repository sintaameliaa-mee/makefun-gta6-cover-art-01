# Neon Sunset Cover Maker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![make.fun bounty](https://img.shields.io/badge/make.fun-gta6--cover--art--01-ff2e88)](https://make.fun/c/gta6-cover-art-01)
[![Node](https://img.shields.io/badge/node-22-brightgreen)](https://nodejs.org/)

A GTA 6-style cover art maker: a static web app that turns your photo and a
caption into a multi-panel poster with bold lettering and a Vice City sunset /
neon colour grade — exported as a PNG to share.

**Bounty:** [gta6-cover-art-01 on make.fun](https://make.fun/c/gta6-cover-art-01) · $250 · closes 21 Nov 2026 10:30 UTC

## How it works

1. **Add a photo** — drop your own photos in, or try a drawn sample. Photos are
   read on your machine and never uploaded.
2. **Pick a layout** — Hero, Split, Triptych or Quartet. Click a panel chip to
   select a panel, click a photo to fill it, drag the preview to position it,
   zoom with the slider.
3. **Colour grade** — Sunset, Neon nights, Noir teal or Golden hour.
4. **Caption** — big Anton display lettering with outline and sunset gradient,
   top or bottom, plus a sub-caption.
5. **Export PNG** — 1080×1080, 1080×1350 or 1920×1080.

Everything is original: no Rockstar Games logo, artwork, character or font.
Display lettering is Anton (SIL Open Font License 1.1, `app/fonts/OFL.txt`).
Sample photos are illustrations drawn by the app itself.

## Run it

Any static server works — for example, from this repo root:

```sh
python3 -m http.server 8080 --directory app
```

then open <http://localhost:8080>. No build step, no network at runtime.

## Files

- `main.ts` — entry program: copies `app/` + `screenshots/` to `/output` and
  writes `dossier.json` with the kit's `vendor/makefun-app.ts`.
- `app/index.html`, `app/style.css` — the editor page.
- `app/src/cover.js` — the cover render engine (panels, grade, palms, caption).
- `app/src/sample.js` — procedural sample photos (drawn, no real people).
- `app/src/main.js` — editor UI wiring.
- `app/fonts/Anton-Regular.ttf` — display font (OFL 1.1).
- `screenshots/` — renders of the app and its exported covers.
