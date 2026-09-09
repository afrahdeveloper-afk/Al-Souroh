/**
 * Al-Sorouh — build-time image optimizer (PROTOCOL 7).
 *
 * Drop original JPEG/PNG (or WebP/TIFF) files into `assets/images/`. This script
 * generates responsive AVIF + WebP variants — plus one same-format fallback —
 * into `public/media/`, preserving the sub-folder structure, and writes
 * `public/media/manifest.json` describing every derivative.
 *
 * Consume the manifest through `src/app/lib/media.ts`, which builds the
 * <picture>/srcSet markup. Never hand-write optimized files, and never commit a
 * raw source image into `public/`.
 *
 *   npm run images          generate what is missing/stale
 *   npm run images -- --force   rebuild everything
 *
 * `vite build` runs this automatically via the plugin in vite.config.ts.
 */
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'assets', 'images');
const OUTPUT_DIR = path.join(ROOT, 'public', 'media');
const MANIFEST = path.join(OUTPUT_DIR, 'manifest.json');
const CACHE = path.join(OUTPUT_DIR, '.build-cache.json');

/** Widths we ship. Any width at or above the source width is skipped. */
const WIDTHS = [480, 768, 1024, 1440, 1920, 2560];
const SOURCE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

/** AVIF first (smallest), WebP second, original format last as the fallback. */
const FORMATS = [
  { ext: 'avif', type: 'image/avif', apply: (p) => p.avif({ quality: 50, effort: 4, chromaSubsampling: '4:2:0' }) },
  { ext: 'webp', type: 'image/webp', apply: (p) => p.webp({ quality: 78, effort: 5 }) },
];

async function walk(dir, base = dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else if (SOURCE_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return out;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function fingerprint(file) {
  const info = await stat(file);
  return createHash('sha1').update(`${info.size}:${info.mtimeMs}`).digest('hex').slice(0, 16);
}

export async function optimizeImages({ force = false, silent = false } = {}) {
  const log = (...args) => { if (!silent) console.log('[images]', ...args); };

  const sources = await walk(SOURCE_DIR);
  if (sources.length === 0) {
    log(`no source images in ${path.relative(ROOT, SOURCE_DIR)} — nothing to do`);
    return { generated: 0, skipped: 0, entries: 0 };
  }

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    throw new Error("sharp is not installed. Run `npm install --save-dev sharp` before generating images.");
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const cache = force ? {} : await readJson(CACHE, {});
  const manifest = {};
  const nextCache = {};
  let generated = 0;
  let skipped = 0;

  for (const rel of sources) {
    const absolute = path.join(SOURCE_DIR, rel);
    const key = rel.replace(/\.[^.]+$/, '');
    const stamp = await fingerprint(absolute);
    const outDir = path.join(OUTPUT_DIR, path.dirname(rel));
    await mkdir(outDir, { recursive: true });

    const metadata = await sharp(absolute).metadata();
    const sourceWidth = metadata.width ?? WIDTHS[WIDTHS.length - 1];
    const widths = WIDTHS.filter((w) => w < sourceWidth);
    if (widths[widths.length - 1] !== sourceWidth) widths.push(sourceWidth);

    const fallbackExt = metadata.hasAlpha ? 'png' : 'jpg';
    const entry = {
      width: sourceWidth,
      height: metadata.height ?? null,
      aspectRatio: metadata.width && metadata.height ? +(metadata.width / metadata.height).toFixed(4) : null,
      widths,
      sources: [],
      fallback: '',
    };

    const fresh = !force && cache[key] === stamp;

    for (const format of FORMATS) {
      const srcset = [];
      for (const width of widths) {
        const outRel = `${key}-${width}w.${format.ext}`;
        const outAbs = path.join(OUTPUT_DIR, outRel);
        if (!fresh) {
          await format
            .apply(sharp(absolute).resize({ width, withoutEnlargement: true }))
            .toFile(outAbs);
          generated += 1;
        }
        srcset.push({ src: `/media/${outRel}`, width });
      }
      entry.sources.push({ type: format.type, srcset });
    }

    const fallbackWidth = widths[widths.length - 1];
    const fallbackRel = `${key}-${fallbackWidth}w.${fallbackExt}`;
    if (!fresh) {
      const pipeline = sharp(absolute).resize({ width: fallbackWidth, withoutEnlargement: true });
      await (fallbackExt === 'png'
        ? pipeline.png({ compressionLevel: 9, palette: true })
        : pipeline.jpeg({ quality: 82, mozjpeg: true })
      ).toFile(path.join(OUTPUT_DIR, fallbackRel));
      generated += 1;
    }
    entry.fallback = `/media/${fallbackRel}`;

    if (fresh) skipped += 1;
    else log(`${rel} → ${widths.length} widths × ${FORMATS.length + 1} formats`);

    manifest[key] = entry;
    nextCache[key] = stamp;
  }

  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(CACHE, `${JSON.stringify(nextCache)}\n`, 'utf8');
  log(`${Object.keys(manifest).length} image(s) in manifest — ${generated} written, ${skipped} up to date`);
  return { generated, skipped, entries: Object.keys(manifest).length };
}

if (process.argv[1]?.endsWith('optimize-images.mjs')) {
  optimizeImages({ force: process.argv.includes('--force') }).catch((error) => {
    console.error('[images]', error.message);
    process.exit(1);
  });
}
