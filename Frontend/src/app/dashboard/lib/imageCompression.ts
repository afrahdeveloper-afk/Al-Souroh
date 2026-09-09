/**
 * Client-side image downscaling + re-encoding, run once when an admin picks
 * a file — before anything is uploaded.
 *
 * Why this exists: every image field in "Souroh Dashboard API.yaml" is a
 * plain file upload, and the Dashboard used to send whatever the admin
 * picked, untouched. A single photo straight off a phone or camera is
 * routinely 4-8 MB, so one Site-Images group (14 slots on the home page)
 * could reach 60-100 MB in one multipart request — minutes on a normal
 * connection, and past `client_max_body_size 30m` in nginx.conf it never
 * arrives at all, which is exactly the "it just keeps loading" the client
 * reported. Nothing on the public site ever renders these at more than
 * ~2560px wide (Protocol 7's largest derivative), so the extra pixels were
 * pure upload cost.
 *
 * Everything here is best-effort by design: any failure (an unusual codec,
 * a canvas the browser refuses to export, a result that comes out larger
 * than the original) returns the ORIGINAL file, so a picked image is never
 * lost or silently degraded into something the backend would reject.
 */

/**
 * Protocol 7's largest generated derivative width. Nothing on the site is
 * ever painted wider than this, so anything above it is upload weight the
 * visitor never sees.
 */
const MAX_DIMENSION = 2560;

/** WebP quality. 0.82 is visually indistinguishable at these sizes and is roughly an order of magnitude smaller than an unprocessed camera JPEG. */
const QUALITY = 0.82;

/**
 * Files already this small are left alone — the re-encode would cost more
 * (a full decode + repaint) than the handful of kilobytes it might save.
 */
const SKIP_BELOW_BYTES = 300 * 1024;

/**
 * `image/gif` is deliberately absent: only `general-information.hero_img`
 * accepts one, and rasterising it to a single WebP frame would silently
 * drop the animation. Those pass through untouched.
 */
const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

function replaceExtension(name: string, extension: string): string {
  const withoutExtension = name.replace(/\.[^.\/]+$/, '');
  return `${withoutExtension || 'image'}.${extension}`;
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('decode failed'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a WebP copy of `file` scaled to fit within MAX_DIMENSION, or the
 * original file whenever compressing it would not actually help (already
 * small, an unsupported/animated format, or a re-encode that came out no
 * smaller). Never throws.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;
  if (file.size < SKIP_BELOW_BYTES) return file;

  try {
    const source = await decode(file);
    const width = 'width' in source ? source.width : 0;
    const height = 'height' in source ? source.height : 0;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(source as CanvasImageSource, 0, 0, targetWidth, targetHeight);
    if ('close' in source && typeof source.close === 'function') source.close();

    const blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;

    return new File([blob], replaceExtension(file.name, 'webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
