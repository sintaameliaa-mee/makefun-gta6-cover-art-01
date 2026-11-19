/**
 * Neon Vice Cover Studio — entrypoint.
 *
 * Copies app/ and screenshots/ into the output directory and writes
 * dossier.json with the kit's buildDossier, so the dossier is byte for byte
 * what the gate rebuilds from the same files. Runs on Node 22, standard
 * library only, no network.
 *
 * The output directory is $MAKEFUN_OUTPUT_DIR when set, else /output.
 * The directory itself is never removed: on the grader it is a mounted
 * volume, so only its contents are emptied before the copy.
 */
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The gate's documented caps for this bounty (RULES.txt, "The gate"):
// dossier text 160 KiB, at most 4 screenshots of 256 KiB each, app/ at most
// 993 entries and 48 MiB, every path at most 1,000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function emptyDirectoryContents(dir: string): void {
  for (const name of readdirSync(dir)) {
    rmSync(join(dir, name), { recursive: true, force: true });
  }
}

function main(): void {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

  mkdirSync(outDir, { recursive: true });
  emptyDirectoryContents(outDir);

  cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), {
    recursive: true,
  });

  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);

  console.log(
    `Neon Vice Cover Studio: app/ + screenshots/ copied to ${outDir}, ` +
      `dossier.json written (${dossier.length} bytes).`,
  );
}

main();
