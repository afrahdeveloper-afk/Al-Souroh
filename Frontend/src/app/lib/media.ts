/**
 * Local optimized imagery (PROTOCOL 7).
 *
 * Reads `public/media/manifest.json`, produced by `scripts/optimize-images.mjs`
 * from the originals in `assets/images/`. Use this for any image that ships with
 * the site. Remote Unsplash imagery goes through `./images.ts` instead.
 *
 * Render with the <ResponsiveImage> component in
 * `src/app/components/ResponsiveImage.tsx` — it emits <picture> with AVIF and
 * WebP sources plus a same-format fallback.
 */
import manifestJson from '../../../public/media/manifest.json';

export interface MediaSource {
  type: string;
  srcset: { src: string; width: number }[];
}

export interface MediaEntry {
  width: number;
  height: number | null;
  aspectRatio: number | null;
  widths: number[];
  sources: MediaSource[];
  fallback: string;
}

const manifest = manifestJson as Record<string, MediaEntry>;

export type MediaKey = keyof typeof manifestJson;

/** Look up an optimized image by its path under `assets/images/`, without extension. */
export function media(key: string): MediaEntry | undefined {
  return manifest[key];
}

/** `"/media/x-480w.avif 480w, /media/x-768w.avif 768w"` for a given source. */
export function toSrcSet(source: MediaSource): string {
  return source.srcset.map(({ src, width }) => `${src} ${width}w`).join(', ');
}
