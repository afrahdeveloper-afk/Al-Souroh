import { apiClient, toFormData, type GetClient } from './client';
import type { ListParams, Paginated, Project, ProjectInput } from '../types';

/** Optional `client` — see `getGeneralInformation` for why (public site vs. Dashboard editor). */
export function listProjects(params: ListParams = {}, client: GetClient = apiClient): Promise<Paginated<Project>> {
  return client.get<Paginated<Project>>('/api/projects/', params);
}

export function getProject(id: string): Promise<Project> {
  return apiClient.get<Project>(`/api/projects/${id}/`);
}

export function createProject(input: ProjectInput): Promise<Project> {
  return apiClient.post<Project>('/api/projects/', toFormData(input));
}

export function updateProject(id: string, input: ProjectInput): Promise<Project> {
  return apiClient.patch<Project>(`/api/projects/${id}/`, toFormData(input));
}

export function deleteProject(id: string): Promise<void> {
  return apiClient.delete(`/api/projects/${id}/`);
}
