# Neon Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sintaameliaa-mee/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sintaameliaa-mee/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your own photos into GTA-style multi-panel cover art: bold caption
lettering, a Vice City sunset or neon colour grade, and a one-click PNG
export in the common post sizes. Entry for the
[make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Any photo** — drop in one photo or several from your machine; every photo
  stays on your machine, nothing is uploaded. A built-in procedurally drawn
  sample scene is included so the app works with no upload at all.
- **Multi-panel layouts** — Hero Trio (one big panel + two small), Quad Grid
  (2×2), or Single Hero (full-bleed). Click any panel in the preview to select
  it, assign a photo to it, and crop/position it with zoom and offset sliders.
- **Captions** — a bold title and a subtitle, editable live, top or bottom
  placement, drawn in Anton (SIL Open Font License).
- **Colour grades** — Vice Sunset (orange/pink dusk), Neon Nights
  (magenta/cyan glow), and Mono Noir (black-and-white with a neon accent).
- **Fast export** — one click exports a PNG at 1080×1080, 1080×1350, or
  1920×1080. Photo to PNG in under a minute.

## Run it

Serve `app/` with any static HTTP server and open `index.html` in a desktop
browser. The app makes no network request at all: every script, style, and
font it loads is a file under `app/`.

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080/
```

## Layout of this repository

- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output
  directory and writes `dossier.json` with the kit's `buildDossier`.
- `app/index.html`, `app/style.css` — the editor page.
- `app/src/main.js` — UI wiring: photos, panels, sliders, export.
- `app/src/cover.js` — the cover renderer: layouts, grades, caption drawing.
- `app/src/sample.js` — procedurally drawn sample scenes (no real photos).
- `app/fonts/` — Anton (SIL OFL 1.1) plus its license.
- `screenshots/` — the cover (landscape export), the editor with a photo
  loaded, a portrait export, and a square export.
- `vendor/makefun-app.ts` — the kit's dossier library, unchanged.

## Originality

Everything here is original: the design, the code, and the sample scenes were
made for this entry. No Rockstar Games logo, wordmark, artwork, character, or
font is used anywhere. The only font is Anton, shipped under the SIL Open Font
License.

## License

MIT — see [LICENSE](LICENSE).
