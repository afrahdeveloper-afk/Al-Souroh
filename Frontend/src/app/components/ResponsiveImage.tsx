/**
 * Responsive <picture> for locally optimized imagery (PROTOCOL 7).
 *
 * Emits AVIF → WebP → original-format fallback at every generated width, so the
 * browser downloads the smallest acceptable file for its screen. Lazy + async by
 * default; pass `priority` for the largest above-the-fold image (which must also
 * be preloaded from index.html).
 */
import type { ImgHTMLAttributes } from 'react';
import { media, toSrcSet } from '../lib/media';

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Manifest key: the path under `assets/images/` without its extension. */
  name: string;
  alt: string;
  /** Layout width hint, e.g. "(min-width: 1024px) 40vw, 100vw". */
  sizes?: string;
  /** Above-the-fold hero image: eager, high priority, never lazy. */
  priority?: boolean;
}

export function ResponsiveImage({
  name,
  alt,
  sizes = '100vw',
  priority = false,
  className,
  style,
  ...rest
}: ResponsiveImageProps) {
  const entry = media(name);

  if (!entry) {
    if (import.meta.env.DEV) {
      console.warn(`[ResponsiveImage] "${name}" is not in public/media/manifest.json. Run: npm run images`);
    }
    return null;
  }

  return (
    <picture>
      {entry.sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={toSrcSet(source)} sizes={sizes} />
      ))}
      <img
        src={entry.fallback}
        alt={alt}
        width={entry.width}
        height={entry.height ?? undefined}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : 'auto'}
        className={className}
        style={style}
        {...rest}
      />
    </picture>
  );
}
