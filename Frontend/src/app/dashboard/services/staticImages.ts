import { apiClient, toFormData, uploadFormData, type GetClient } from './client';
import {
  ApiError,
  STATIC_IMAGE_FIELDS,
  type StaticImageGroupKey,
  type StaticImageInput,
  type StaticImageRecordMap,
} from '../types';

/**
 * The six `/api/static-images/<group>/` singletons — the photography every
 * public page shows outside of any CRUD record (the homepage's scroll
 * scenes, the About gallery, each route's own hero banner).
 *
 * One generic module rather than six near-identical files: the endpoints
 * differ only in their path and their set of image fields, both of which
 * are already described by `STATIC_IMAGE_FIELDS` in ../types. The group key
 * is the URL segment itself, so there is no second mapping to keep in sync.
 *
 * All writes are multipart — every field on every one of these schemas is a
 * file. `create` requires the group's complete field set (the backend marks
 * them all required on POST); `update` sends only what the caller passes,
 * so an untouched slot keeps whatever image is already stored.
 */

const BASE = '/api/static-images';

/**
 * `null` when nothing has been uploaded for this page yet — a save then has
 * to POST the group's complete set rather than PATCH.
 *
 * Unlike `/api/general-information/` and `/api/contact-us/`, these six
 * endpoints do NOT 404 on an empty singleton: confirmed live against the
 * real API, all six answer `200 {}` before anything is saved. An empty body
 * is truthy in JS, so treating the response itself as "a record exists"
 * would send a PATCH that can never satisfy the endpoint's all-fields-
 * required create. The presence of `id` is what actually distinguishes a
 * stored record from that empty placeholder; the 404 branch is kept as well
 * in case the backend later switches to the other convention.
 */
export async function getStaticImages<K extends StaticImageGroupKey>(
  group: K,
  client: GetClient = apiClient,
): Promise<StaticImageRecordMap[K] | null> {
  try {
    const body = await client.get<StaticImageRecordMap[K] | Record<string, never>>(
      `${BASE}/${group}/`,
    );
    if (!body || typeof (body as { id?: unknown }).id !== 'number') return null;
    return body as StaticImageRecordMap[K];
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Both writes go through `uploadFormData` rather than `apiClient` so the
 * editor can report upload progress: the home-page group alone sends
 * fourteen files in one request, and a spinner with no numbers on a payload
 * that size is indistinguishable from a hang. Behaviour is otherwise
 * identical to an `apiClient.post`/`.patch` (same CSRF handling, same
 * ApiError on failure).
 */
export function createStaticImages<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
  onProgress?: (fraction: number) => void,
): Promise<StaticImageRecordMap[K]> {
  return uploadFormData<StaticImageRecordMap[K]>(
    `${BASE}/${group}/`,
    'POST',
    toFormData(input as Record<string, File>),
    onProgress,
  );
}

export function updateStaticImages<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
  onProgress?: (fraction: number) => void,
): Promise<StaticImageRecordMap[K]> {
  return uploadFormData<StaticImageRecordMap[K]>(
    `${BASE}/${group}/`,
    'PATCH',
    toFormData(input as Record<string, File>),
    onProgress,
  );
}

/**
 * Field keys of `group` that the caller has NOT supplied a file for. Used by
 * the editor to block a first-ever save (POST) with a precise "these slots
 * are still empty" message instead of letting the backend reject the whole
 * request with a field-by-field 400.
 */
export function missingRequiredFields<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
): string[] {
  return (STATIC_IMAGE_FIELDS[group] as readonly string[]).filter(
    (field) => !(input as Record<string, File | undefined>)[field],
  );
}
