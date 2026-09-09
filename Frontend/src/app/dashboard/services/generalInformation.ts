import { apiClient, toFormData } from './client';
import { ApiError, type GeneralInformation, type GeneralInformationInput } from '../types';

/**
 * Singleton resource (powers the public Hero) — multipart-only per the
 * OpenAPI schema (hero_img is a file field on every write). `null` on a 404
 * means no record exists yet, so the Homepage editor knows to POST instead
 * of PATCH on first save.
 */
export async function getGeneralInformation(): Promise<GeneralInformation | null> {
  try {
    return await apiClient.get<GeneralInformation>('/api/general-information/');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createGeneralInformation(input: Required<GeneralInformationInput>): Promise<GeneralInformation> {
  return apiClient.post<GeneralInformation>('/api/general-information/', toFormData(input));
}

export function updateGeneralInformation(input: GeneralInformationInput): Promise<GeneralInformation> {
  return apiClient.patch<GeneralInformation>('/api/general-information/', toFormData(input));
}
