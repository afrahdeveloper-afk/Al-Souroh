import { supabase } from '../../lib/supabaseClient';
import { unwrap, unwrapMaybe, uploadImage } from './client';
import { ApiError } from '../types';
import type { ListParams, Paginated, Service, ServiceInput } from '../types';

const TABLE = 'services';
const FOLDER = 'services';
const PAGE_SIZE = 10;

export async function listServices(params: ListParams = {}): Promise<Paginated<Service>> {
  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('service_priority', { ascending: true })
    .order('id', { ascending: true })
    .range(from, to);

  if (params.search) {
    query = query.or(`service_name.ilike.%${params.search}%,service_name_ar.ilike.%${params.search}%`);
  }

  const result = await query;
  const results = unwrap<Service[]>(result);
  const count = result.count ?? results.length;

  return {
    count,
    next: from + PAGE_SIZE < count ? String(page + 1) : null,
    previous: page > 1 ? String(page - 1) : null,
    results,
  };
}

export async function getService(id: number): Promise<Service> {
  const result = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  const service = unwrapMaybe<Service>(result);
  if (!service) throw new ApiError(404, { detail: 'Not found.' });
  return service;
}

export async function createService(input: Required<ServiceInput>): Promise<Service> {
  const { img: file, ...rest } = input;
  const img = await uploadImage(file, FOLDER);
  const result = await supabase.from(TABLE).insert({ ...rest, img }).select().single();
  return unwrap<Service>(result);
}

export async function updateService(id: number, input: ServiceInput): Promise<Service> {
  const { img: file, ...rest } = input;
  const patch: Record<string, unknown> = { ...rest };
  if (file) patch.img = await uploadImage(file, FOLDER);

  const result = await supabase.from(TABLE).update(patch).eq('id', id).select().single();
  return unwrap<Service>(result);
}

export function deleteService(id: number): Promise<void> {
  return supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .then((result) => {
      unwrap(result);
    });
}

/**
 * The public site's service order, applied client-side.
 *
 * `service_priority` is the backend's own display-order field ("Lower
 * numbers appear first"). A record saved before the field existed comes
 * back without it; those sort after every prioritized one rather than
 * silently jumping to the front (a missing value is not zero). `id` breaks
 * ties, so equal priorities stay in a stable, predictable order instead of
 * shuffling between requests.
 */
export function sortServicesByPriority<T extends Pick<Service, 'id' | 'service_priority'>>(
  services: T[],
): T[] {
  return [...services].sort((a, b) => {
    const ap = a.service_priority ?? Number.POSITIVE_INFINITY;
    const bp = b.service_priority ?? Number.POSITIVE_INFINITY;
    return ap === bp ? a.id - b.id : ap - bp;
  });
}
