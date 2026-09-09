import { apiClient, toFormData } from './client';
import type { ListParams, Paginated, Service, ServiceInput } from '../types';

export function listServices(params: ListParams = {}): Promise<Paginated<Service>> {
  return apiClient.get<Paginated<Service>>('/api/services/', params);
}

export function getService(id: number): Promise<Service> {
  return apiClient.get<Service>(`/api/services/${id}/`);
}

export function createService(input: Required<ServiceInput>): Promise<Service> {
  return apiClient.post<Service>('/api/services/', toFormData(input));
}

export function updateService(id: number, input: ServiceInput): Promise<Service> {
  return apiClient.patch<Service>(`/api/services/${id}/`, toFormData(input));
}

export function deleteService(id: number): Promise<void> {
  return apiClient.delete(`/api/services/${id}/`);
}

/**
 * The public site's service order, applied client-side.
 *
 * `service_priority` is the backend's own display-order field ("Lower
 * numbers appear first"), but `/api/services/` exposes no `ordering` query
 * parameter and makes no promise about the order it returns rows in — so
 * whoever renders a service list is responsible for applying it. Every
 * consumer goes through this one function so the public Services page, the
 * homepage rail and the Dashboard's own list can never disagree about what
 * "first" means.
 *
 * A record saved before the field existed comes back without it; those sort
 * after every prioritized one rather than silently jumping to the front (a
 * missing value is not zero). `id` breaks ties, so equal priorities — the
 * current state of every record — stay in a stable, predictable order
 * instead of shuffling between requests.
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
