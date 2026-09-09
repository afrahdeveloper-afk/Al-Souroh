import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe, uploadImage } from './client';
import { ApiError } from '../types';
import type { ListParams, Paginated, Project, ProjectInput } from '../types';

const TABLE = 'projects';
const SELECT = '*, project_categories(category_name, category_name_ar)';
const PAGE_SIZE = 10;

type ProjectRow = {
  id: string;
  category_id: string;
  project_name: string;
  project_name_ar: string;
  car_model: string;
  date: string;
  project_description: string;
  project_description_ar: string;
  cover_img: string | null;
  before_img: string | null;
  after_img: string | null;
  project_categories: { category_name: string; category_name_ar: string } | null;
};

/** Flattens the joined `project_categories` row into `Project`'s denormalized `category_name`/`category_name_ar` — the same shape the old DRF serializer computed via `source='category.category_name'`. */
function toProject(row: ProjectRow): Project {
  const { project_categories, category_id, ...rest } = row;
  return {
    ...rest,
    category: category_id,
    category_name: project_categories?.category_name ?? '',
    category_name_ar: project_categories?.category_name_ar ?? '',
  };
}

export async function listProjects(params: ListParams = {}): Promise<Paginated<Project>> {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(TABLE)
    .select(SELECT, { count: 'exact' })
    .order('date', { ascending: false })
    .range(from, to);

  if (params.search) {
    query = query.or(`project_name.ilike.%${params.search}%,project_name_ar.ilike.%${params.search}%`);
  }

  const result = await query;
  const rows = unwrap<ProjectRow[]>(result as any);
  const count = result.count ?? rows.length;

  return {
    count,
    next: from + PAGE_SIZE < count ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results: rows.map(toProject),
  };
}

export async function getProject(id: string): Promise<Project> {
  const result = await supabase.from(TABLE).select(SELECT).eq('id', id).maybeSingle();
  const row = unwrapMaybe<ProjectRow>(result as any);
  if (!row) throw new ApiError(404, { detail: 'Not found.' });
  return toProject(row);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { category, cover_img, before_img, after_img, ...rest } = input;
  const row: Record<string, unknown> = { ...rest, category_id: category };
  if (cover_img) row.cover_img = await uploadImage(cover_img, 'projects/covers');
  if (before_img) row.before_img = await uploadImage(before_img, 'projects/before');
  if (after_img) row.after_img = await uploadImage(after_img, 'projects/after');

  const result = await supabase.from(TABLE).insert(row).select(SELECT).single();
  return toProject(unwrap<ProjectRow>(result as any));
}

export async function updateProject(id: string, input: ProjectInput): Promise<Project> {
  const { category, cover_img, before_img, after_img, ...rest } = input;
  const row: Record<string, unknown> = { ...rest, category_id: category };
  if (cover_img) row.cover_img = await uploadImage(cover_img, 'projects/covers');
  if (before_img) row.before_img = await uploadImage(before_img, 'projects/before');
  if (after_img) row.after_img = await uploadImage(after_img, 'projects/after');

  const result = await supabase.from(TABLE).update(row).eq('id', id).select(SELECT).single();
  return toProject(unwrap<ProjectRow>(result as any));
}

export function deleteProject(id: string): Promise<void> {
  return supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .then((result) => {
      unwrap(result);
    });
}
