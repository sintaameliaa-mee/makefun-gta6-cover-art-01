// Neon Sunset Cover Maker — entry program (Node 22, standard library only).
// Copies app/ and screenshots/ into the output directory and writes the
// dossier.json that the kit's vendor library builds from them.
// The output directory itself is never removed: on the grader it is a mounted
// volume, so only its contents are cleared, one child at a time.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDossier } from './vendor/makefun-app.ts';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const rootDir = new URL('.', import.meta.url).pathname;

/** Empties a directory's contents without removing the directory itself. */
function emptyContents(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

emptyContents(outDir);
cpSync(join(rootDir, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(rootDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`Wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes).`);
