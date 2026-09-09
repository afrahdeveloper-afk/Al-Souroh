import { apiClient, toFormData } from './client';
import type { ListParams, Paginated, Project, ProjectInput } from '../types';

export function listProjects(params: ListParams = {}): Promise<Paginated<Project>> {
  return apiClient.get<Paginated<Project>>('/api/projects/', params);
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
