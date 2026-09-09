import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe } from './client';
import { ApiError } from '../types';
import type { ListParams, Paginated, ProjectCategory, ProjectCategoryInput } from '../types';

const TABLE = 'project_categories';
const PAGE_SIZE = 10;

export async function listProjectCategories(params: ListParams = {}): Promise<Paginated<ProjectCategory>> {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('category_name', { ascending: true })
    .range(from, to);

  if (params.search) {
    query = query.or(`category_name.ilike.%${params.search}%,category_name_ar.ilike.%${params.search}%`);
  }

  const result = await query;
  const results = unwrap<ProjectCategory[]>(result);
  const count = result.count ?? results.length;

  return {
    count,
    next: from + PAGE_SIZE < count ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results,
  };
}

export async function getProjectCategory(id: string): Promise<ProjectCategory> {
  const result = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  const category = unwrapMaybe<ProjectCategory>(result);
  if (!category) throw new ApiError(404, { detail: 'Not found.' });
  return category;
}

export async function createProjectCategory(input: ProjectCategoryInput): Promise<ProjectCategory> {
  const result = await supabase.from(TABLE).insert(input).select().single();
  return unwrap<ProjectCategory>(result);
}

export async function updateProjectCategory(id: string, input: ProjectCategoryInput): Promise<ProjectCategory> {
  const result = await supabase.from(TABLE).update(input).eq('id', id).select().single();
  return unwrap<ProjectCategory>(result);
}

/** Rejects with an ApiError (409-style) if the category still has projects referencing it — Postgres' `ON DELETE RESTRICT` on `projects.category_id` raises error code 23503, which this maps to the same friendly shape the old Django PROTECT-constraint handling returned. */
export async function deleteProjectCategory(id: string): Promise<void> {
  const result = await supabase.from(TABLE).delete().eq('id', id);
  if (result.error) {
    if (result.error.code === '23503') {
      throw new ApiError(409, { detail: 'This category still has projects assigned to it.' });
    }
    throw new ApiError(result.status || 400, { detail: result.error.message, code: result.error.code });
  }
}
