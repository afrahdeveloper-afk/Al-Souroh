import { apiClient, type GetClient } from './client';
import { ApiError, type ContactUs, type ContactUsInput } from '../types';

/**
 * Singleton resource — the backend only ever holds one Contact Us record.
 * `getContactUs` returns `null` on a 404 so callers can tell "no record yet"
 * apart from a real failure and decide whether to POST (create) or
 * PATCH (update) on save.
 *
 * Optional `client` — see `getGeneralInformation` for why (public site vs.
 * Dashboard editor).
 */
export async function getContactUs(client: GetClient = apiClient): Promise<ContactUs | null> {
  try {
    return await client.get<ContactUs>('/api/contact-us/');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createContactUs(input: ContactUsInput): Promise<ContactUs> {
  return apiClient.post<ContactUs>('/api/contact-us/', input);
}

export function updateContactUs(input: Partial<ContactUsInput>): Promise<ContactUs> {
  return apiClient.patch<ContactUs>('/api/contact-us/', input);
}
