import { apiClient, clearCsrfToken, getCsrfToken, setCsrfToken } from './client';
import type { CurrentUser } from '../types';

type LoginResponse = {
  detail: string;
  user: CurrentUser;
  csrftoken: string;
};

/** GET /api/auth/user/ — 401/403 (no session) is a normal "not logged in" outcome, not an error. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await apiClient.get<CurrentUser>('/api/auth/user/');
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<CurrentUser> {
  await getCsrfToken();
  const response = await apiClient.post<LoginResponse>('/api/auth/login/', { username, password });
  setCsrfToken(response.csrftoken);
  return response.user;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout/');
  clearCsrfToken();
}
