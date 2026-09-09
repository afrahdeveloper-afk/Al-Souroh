import { apiClient, toFormData, type GetClient } from './client';
import type { ListParams, News, NewsInput, Paginated } from '../types';

/** Optional `client` — see `getGeneralInformation` for why (public site vs. Dashboard editor). */
export function listNews(params: ListParams = {}, client: GetClient = apiClient): Promise<Paginated<News>> {
  return client.get<Paginated<News>>('/api/news/', params);
}

/** Optional `client` — see `getGeneralInformation` for why (public site vs. Dashboard editor). */
export function getNews(id: number, client: GetClient = apiClient): Promise<News> {
  return client.get<News>(`/api/news/${id}/`);
}

export function createNews(input: Required<NewsInput>): Promise<News> {
  return apiClient.post<News>('/api/news/', toFormData(input));
}

export function updateNews(id: number, input: NewsInput): Promise<News> {
  return apiClient.patch<News>(`/api/news/${id}/`, toFormData(input));
}

export function deleteNews(id: number): Promise<void> {
  return apiClient.delete(`/api/news/${id}/`);
}

/** Lightweight JSON PATCH for the List page's star toggle — no image/text fields involved. */
export function setNewsFeatured(id: number, is_featured: boolean): Promise<News> {
  return apiClient.patch<News>(`/api/news/${id}/`, { is_featured });
}
