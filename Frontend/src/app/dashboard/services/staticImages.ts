import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe, uploadImage } from './client';
import {
  STATIC_IMAGE_FIELDS,
  type StaticImageGroupKey,
  type StaticImageInput,
  type StaticImageRecordMap,
} from '../types';

/**
 * The six `/static-images` singletons — the photography every public page
 * shows outside of any CRUD record (the homepage's scroll scenes, the About
 * gallery, each route's own hero banner). One generic module rather than
 * six near-identical files: the tables differ only in name and field set,
 * both described below, mirroring `STATIC_IMAGE_FIELDS` in ../types.
 */

const ROW_ID = 1;

const TABLE_BY_GROUP: Record<StaticImageGroupKey, string> = {
  'home-page': 'home_page_images',
  'about-us': 'about_us_images',
  services: 'services_page_image',
  projects: 'projects_page_image',
  news: 'news_page_image',
  'contact-us': 'contact_us_page_image',
};

/** `null` when nothing has been uploaded for this page yet, so a save knows to create rather than update. */
export async function getStaticImages<K extends StaticImageGroupKey>(
  group: K,
): Promise<StaticImageRecordMap[K] | null> {
  const result = await supabase.from(TABLE_BY_GROUP[group]).select('*').eq('id', ROW_ID).maybeSingle();
  return unwrapMaybe<StaticImageRecordMap[K]>(result);
}

/** Uploads every File in `input` (sequentially — this is an infrequent admin-only action, not worth parallelizing) and returns the field→URL row to write. `onProgress` is called once, at 1, once every upload has finished — Supabase's upload doesn't expose per-byte progress the way the old XHR-based multipart upload did. */
async function uploadFields<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
  onProgress?: (fraction: number) => void,
): Promise<Record<string, string>> {
  const row: Record<string, string> = {};
  for (const [field, file] of Object.entries(input) as [string, File | undefined][]) {
    if (!file) continue;
    row[field] = await uploadImage(file, `static-images/${group}`);
  }
  onProgress?.(1);
  return row;
}

export async function createStaticImages<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
  onProgress?: (fraction: number) => void,
): Promise<StaticImageRecordMap[K]> {
  const row = await uploadFields(group, input, onProgress);
  const result = await supabase
    .from(TABLE_BY_GROUP[group])
    .insert({ id: ROW_ID, ...row })
    .select()
    .single();
  return unwrap<StaticImageRecordMap[K]>(result);
}

export async function updateStaticImages<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
  onProgress?: (fraction: number) => void,
): Promise<StaticImageRecordMap[K]> {
  const row = await uploadFields(group, input, onProgress);
  const result = await supabase.from(TABLE_BY_GROUP[group]).update(row).eq('id', ROW_ID).select().single();
  return unwrap<StaticImageRecordMap[K]>(result);
}

/**
 * Field keys of `group` that the caller has NOT supplied a file for. Used by
 * the editor to block a first-ever save (create) with a precise "these slots
 * are still empty" message instead of letting the write fail on a NOT NULL
 * column.
 */
export function missingRequiredFields<K extends StaticImageGroupKey>(
  group: K,
  input: StaticImageInput<K>,
): string[] {
  return (STATIC_IMAGE_FIELDS[group] as readonly string[]).filter(
    (field) => !(input as Record<string, File | undefined>)[field],
  );
}
