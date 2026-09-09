import { apiClient } from './client';
import type { ListParams, Paginated, ProjectCategory, ProjectCategoryInput } from '../types';

export function listProjectCategories(params: ListParams = {}): Promise<Paginated<ProjectCategory>> {
  return apiClient.get<Paginated<ProjectCategory>>('/api/project-categories/', params);
}

export function getProjectCategory(id: string): Promise<ProjectCategory> {
  return apiClient.get<ProjectCategory>(`/api/project-categories/${id}/`);
}

export function createProjectCategory(input: ProjectCategoryInput): Promise<ProjectCategory> {
  return apiClient.post<ProjectCategory>('/api/project-categories/', input);
}

export function updateProjectCategory(id: string, input: ProjectCategoryInput): Promise<ProjectCategory> {
  return apiClient.patch<ProjectCategory>(`/api/project-categories/${id}/`, input);
}

/** Rejects with an ApiError if the category still has associated projects (backend enforces PROTECT). */
export function deleteProjectCategory(id: string): Promise<void> {
  return apiClient.delete(`/api/project-categories/${id}/`);
}
