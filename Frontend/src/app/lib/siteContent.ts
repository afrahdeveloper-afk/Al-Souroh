import { useEffect, useState } from 'react';

import { getContactUs } from '../dashboard/services/contactUs';
import { getGeneralInformation } from '../dashboard/services/generalInformation';
import { getStaticImages } from '../dashboard/services/staticImages';
import type {
  ContactUs,
  GeneralInformation,
  StaticImageGroupKey,
  StaticImageRecordMap,
} from '../dashboard/types';

/**
 * Shared, process-wide cache for the CMS content every public page reads —
 * the six `/api/static-images/` singletons plus the two records
 * (GeneralInformation, ContactUs) that several components each need.
 *
 * Why this exists on top of `useApiResource`: that hook fetches per mount,
 * so the same record was being requested several times over (ContactUs
 * alone was fetched three times on the homepage — Nav, Hero and
 * HomeFooter each call it), and every route change refetched everything
 * from scratch. Since all of this is site-wide content that changes only
 * when an admin saves in the Dashboard, one in-flight promise per resource
 * for the life of the page load is both correct and much cheaper.
 *
 * A resolved value is kept synchronously alongside its promise, so a
 * component that mounts after the first fetch renders the real image URL on
 * its very first paint instead of flashing an empty frame for a tick.
 *
 * None of this is used by the Dashboard — its editors must always see the
 * record as it currently stands on the server, including right after they
 * save it, so they keep calling the service modules directly.
 */


/**
 * Normalizes an image URL coming back from the API.
 *
 * The backend hands out absolute `http://apisorouh.trycvision.com/media/...`
 * URLs. A browser on an https page blocks those outright as mixed content —
 * the image simply never appears, with no visible error anywhere in the app.
 * The same host serves every one of those files over https (verified live),
 * so on an https page the scheme is upgraded. On a plain http page (local
 * dev) the URL is left exactly as the backend gave it, since there is no
 * mixed-content rule to satisfy there and nothing to gain by rewriting.
 *
 * Returns `undefined` for a missing/blank value, so callers can use it
 * directly as the condition for whether to render an `<img>` at all.
 */
export function mediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    trimmed.startsWith('http://')
  ) {
    return `https://${trimmed.slice('http://'.length)}`;
  }
  return trimmed;
}


type Cached<T> = { promise: Promise<T | null>; value: T | null };

const cache = new Map<string, Cached<unknown>>();

function cached<T>(key: string, load: () => Promise<T | null>): Cached<T> {
  const existing = cache.get(key) as Cached<T> | undefined;
  if (existing) return existing;

  const entry: Cached<T> = { promise: null as unknown as Promise<T | null>, value: null };
  entry.promise = load()
    .then((value) => {
      entry.value = value;
      return value;
    })
    .catch(() => null);
  cache.set(key, entry as Cached<unknown>);
  return entry;
}

export function loadStaticImages<K extends StaticImageGroupKey>(
  group: K,
): Promise<StaticImageRecordMap[K] | null> {
  return cached(`static-images:${group}`, () => getStaticImages(group)).promise;
}

export function loadGeneralInformation(): Promise<GeneralInformation | null> {
  return cached('general-information', () => getGeneralInformation()).promise;
}

export function loadContactUs(): Promise<ContactUs | null> {
  return cached('contact-us', () => getContactUs()).promise;
}


function useCached<T>(key: string, load: () => Promise<T | null>): T | null {
  const [value, setValue] = useState<T | null>(() => (cache.get(key) as Cached<T> | undefined)?.value ?? null);

  useEffect(() => {
    let cancelled = false;
    cached(key, load).promise.then((resolved) => {
      if (!cancelled) setValue(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return value;
}

/** The `/api/static-images/<group>/` record, or null until it loads. */
export function useStaticImages<K extends StaticImageGroupKey>(
  group: K,
): StaticImageRecordMap[K] | null {
  return useCached(`static-images:${group}`, () => getStaticImages(group));
}

/** The single hero image of a Services / Projects / News / Contact page. */
export function usePageHeroImage(
  group: 'services' | 'projects' | 'news' | 'contact-us',
): string | undefined {
  return mediaUrl(useStaticImages(group)?.main_image);
}

export function useGeneralInformation(): GeneralInformation | null {
  return useCached('general-information', () => getGeneralInformation());
}

export function useContactUs(): ContactUs | null {
  return useCached('contact-us', () => getContactUs());
}


const preloaded = new Set<string>();

/**
 * Warms the HTTP cache for images the visitor is about to see. Every
 * scroll-driven scene on this site renders its photograph the instant the
 * visitor reaches it — far too late to start a cross-origin download — so
 * the bytes are fetched ahead of time instead, while the intro is still on
 * screen and the connection is otherwise idle.
 *
 * Two mechanisms, deliberately:
 * - `'high'` uses `<link rel="preload" as="image" fetchpriority="high">`,
 *   which jumps the queue. Reserved for the one or two images that are
 *   about to be on screen — the hero and the first scroll frame.
 * - `'low'` uses a detached `Image()` at `fetchPriority: 'low'`. It lands
 *   in the same HTTP cache without competing for bandwidth, and — unlike
 *   `rel=preload` — carries no "preloaded but not used within a few
 *   seconds" console warning, which is exactly the situation for a photo
 *   the visitor reaches thirty seconds of scrolling later, or one that
 *   belongs to a route they have not opened yet.
 */
export function preloadImages(
  urls: (string | null | undefined)[],
  priority: 'high' | 'low' = 'low',
): void {
  if (typeof document === 'undefined') return;
  for (const raw of urls) {
    const url = mediaUrl(raw);
    if (!url || preloaded.has(url)) continue;
    preloaded.add(url);

    if (priority === 'high') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      link.setAttribute('fetchpriority', priority);
      document.head.appendChild(link);
      continue;
    }

    const image = new Image();
    (image as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
    image.decoding = 'async';
    image.src = url;
  }
}

/**
 * Fired once from `main.tsx`, before React even mounts, so the CMS records
 * and the images they point at are already in flight during module
 * evaluation, hydration and the ~5s homepage intro — rather than starting
 * only once each scene's component happens to mount.
 *
 * Ordering matters more than the list itself: the hero image is fetched at
 * high priority (it is the LCP element), the first transformation frame
 * right behind it (it is the very next thing the visitor scrolls into), and
 * everything below the fold at low priority so it fills whatever bandwidth
 * is left over without slowing the two that are actually visible.
 */
export function warmHomeContent(): void {
  loadGeneralInformation().then((info) => {
    preloadImages([info?.hero_img], 'high');
  });

  loadStaticImages('home-page').then((images) => {
    if (!images) return;
    preloadImages([images.first_step_image], 'high');
    preloadImages(
      [
        images.second_step_image,
        images.third_step_image,
        images.fourth_step_image,
        images.story_image,
        images.case_study_before_image,
        images.case_study_after_image,
        images.process_image_first,
        images.process_image_second,
        images.process_image_third,
        images.process_image_fourth,
        images.process_image_fifth,
        images.process_image_sixth,
        images.end_image,
      ],
      'low',
    );
  });

  loadContactUs();

  schedule(() => {
    void Promise.all(
      (['about-us', 'services', 'projects', 'news', 'contact-us'] as const).map((group) =>
        loadStaticImages(group).then((images) => {
          if (!images) return;
          preloadImages(Object.values(images).filter((v) => typeof v === 'string'), 'low');
        }),
      ),
    );
  });
}

/** requestIdleCallback where available, a plain delay everywhere else. */
function schedule(task: () => void): void {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (ric) ric(task, { timeout: 5000 });
  else window.setTimeout(task, 2500);
}
