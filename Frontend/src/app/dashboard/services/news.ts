import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe, uploadImage } from './client';
import { ApiError } from '../types';
import type { ListParams, News, NewsInput, Paginated } from '../types';

const TABLE = 'news';
const FOLDER = 'news';
const PAGE_SIZE = 10;

// `created_at` drives the default ordering but was never part of the old
// API's response shape (the DRF serializer used an explicit field list) —
// selecting these columns explicitly keeps that the same.
const COLUMNS =
  'id, news_title, news_title_ar, news_description, news_description_ar, news_content, news_content_ar, news_img, is_featured';

export async function listNews(params: ListParams = {}): Promise<Paginated<News>> {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(TABLE)
    .select(COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (params.search) {
    query = query.or(`news_title.ilike.%${params.search}%,news_title_ar.ilike.%${params.search}%`);
  }

  const result = await query;
  const results = unwrap<News[]>(result as any);
  const count = result.count ?? results.length;

  return {
    count,
    next: from + PAGE_SIZE < count ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results,
  };
}

export async function getNews(id: number): Promise<News> {
  const result = await supabase.from(TABLE).select(COLUMNS).eq('id', id).maybeSingle();
  const news = unwrapMaybe<News>(result as any);
  if (!news) throw new ApiError(404, { detail: 'Not found.' });
  return news;
}

export async function createNews(input: Required<NewsInput>): Promise<News> {
  const { news_img: file, ...rest } = input;
  const news_img = await uploadImage(file, FOLDER);
  const result = await supabase.from(TABLE).insert({ ...rest, news_img }).select(COLUMNS).single();
  return unwrap<News>(result as any);
}

export async function updateNews(id: number, input: NewsInput): Promise<News> {
  const { news_img: file, ...rest } = input;
  const patch: Record<string, unknown> = { ...rest };
  if (file) patch.news_img = await uploadImage(file, FOLDER);

  const result = await supabase.from(TABLE).update(patch).eq('id', id).select(COLUMNS).single();
  return unwrap<News>(result as any);
}

export function deleteNews(id: number): Promise<void> {
  return supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .then((result) => {
      unwrap(result);
    });
}

/** Lightweight update for the List page's star toggle — no image/text fields involved. The single-featured-row rule is enforced by a trigger (`news_single_featured` in supabase/schema.sql), not here. */
export async function setNewsFeatured(id: number, is_featured: boolean): Promise<News> {
  const result = await supabase.from(TABLE).update({ is_featured }).eq('id', id).select(COLUMNS).single();
  return unwrap<News>(result as any);
}
