import { ApiError, type ApiErrorBody } from '../dashboard/types';

/**
 * Client for the public, anonymous-safe reads only — every GET endpoint is
 * public per the API's own description (see core/settings.py's
 * SPECTACULAR_SETTINGS). Unlike `dashboard/services/client.ts`'s
 * `apiClient`, this calls the backend's real origin directly instead of this
 * deployment's own `/api/...` path: a read needs no session cookie, so
 * there's nothing for a same-origin proxy to protect here.
 *
 * Never use this for a write, or for anything that must reflect the current
 * user's session (the Dashboard) — `apiClient` stays same-origin for that on
 * purpose; see the note at the top of `dashboard/services/client.ts`.
 */
const BACKEND_ORIGIN = 'https://apisorouh.trycvision.com';

function resolveUrl(
  path: string,
  query?: Record<string, string | number | undefined>,
): string {
  const url = new URL(path, BACKEND_ORIGIN);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function safeJson(response: Response): Promise<ApiErrorBody | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const publicClient = {
  async get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const response = await fetch(resolveUrl(path, query));

    if (response.status === 204) return undefined as T;

    const body = await safeJson(response);
    if (!response.ok) throw new ApiError(response.status, body);

    return body as T;
  },
};
