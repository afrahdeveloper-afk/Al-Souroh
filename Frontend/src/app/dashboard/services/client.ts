import { ApiError, type ApiErrorBody } from "../types";

/**
 * Low-level HTTP client for the real Souroh Dashboard API
 * ("Souroh Dashboard API.yaml" — Django/DRF, session + CSRF cookie auth).
 *
 * Every call goes through this deployment's own same-site origin, never the
 * absolute `https://apisorouh.trycvision.com/` origin directly. This is
 * load-bearing, not a style choice: the backend's session/CSRF cookies are
 * `SameSite=Lax` (confirmed live against the real API), which browsers
 * refuse to attach to cross-site fetch()/XHR calls — only same-site
 * requests keep the cookie. Calling the API directly from a different
 * origin would make login look like it succeeds while every following
 * authenticated request silently behaves as anonymous.
 *
 * Dev and prod both just call plain `/api/...` paths — same-origin by
 * construction — and rely on a reverse proxy in front of this app to
 * forward them to the real backend with the Origin header rewritten to
 * match (Django's CSRF middleware compares Origin against Host and rejects
 * a mismatch on any session-authenticated write):
 * - **Dev** — `vite.config.ts`'s `server.proxy`.
 * - **Prod (VPS/Coolify)** — `nginx.conf`'s `location /api/` block, baked
 *   into the Docker image built from the repo root `Dockerfile`.
 *
 * (An earlier Vercel deployment routed prod through a query-param rewrite
 * to a Serverless Function — `api/proxy.js` — because a plain `vercel.json`
 * `rewrites` proxy didn't work on that project. Both files are still in the
 * repo but are unused by the current nginx-based deployment.)
 */

const CSRF_HEADER = "X-CSRFToken";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function resolveUrl(
  path: string,
  extraQuery?: Record<string, string | number | undefined>,
): string {
  const [pathname, existingQuery] = path.split("?");
  const params = new URLSearchParams(existingQuery);

  if (extraQuery) {
    for (const [key, value] of Object.entries(extraQuery)) {
      if (value !== undefined && value !== "") params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

let cachedCsrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

/**
 * Fetches (and memoizes) a CSRF token for use on write requests. Django
 * masks the token differently on every call for BREACH mitigation, but any
 * value returned here validates against the same underlying session cookie
 * — so an in-memory cache is safe and avoids an extra round trip per write.
 * Call `refreshCsrfToken` instead to force a new one (e.g. after the server
 * reports a stale/invalid token).
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  if (!csrfFetchPromise) {
    csrfFetchPromise = fetch(resolveUrl("/api/auth/csrf/"), {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new ApiError(response.status, await safeJson(response));
        const body = (await response.json()) as { csrftoken: string };
        cachedCsrfToken = body.csrftoken;
        return body.csrftoken;
      })
      .finally(() => {
        csrfFetchPromise = null;
      });
  }
  return csrfFetchPromise;
}

export function refreshCsrfToken(): Promise<string> {
  cachedCsrfToken = null;
  return getCsrfToken();
}

/** Adopts a token handed back directly by an endpoint (e.g. login's response body) without an extra round trip. */
export function setCsrfToken(token: string): void {
  cachedCsrfToken = token;
}

/** Called once on logout so a stale token from the previous session is never reused. */
export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

async function safeJson(response: Response): Promise<ApiErrorBody | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

type RequestOptions = {
  method?: string;
  /** Plain object → sent as JSON. FormData → sent as multipart, untouched. */
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

/**
 * Core request function. Retries exactly once on a 403 whose body looks
 * like a CSRF failure, after refreshing the token — covers the case where
 * the cached token's underlying cookie expired or was rotated server-side.
 */
async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  const method = options.method ?? "GET";
  const url = resolveUrl(path, options.query);
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  if (UNSAFE_METHODS.has(method)) {
    headers[CSRF_HEADER] = await getCsrfToken();
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (response.status === 204) return undefined as T;

  const responseBody = await safeJson(response);

  if (!response.ok) {
    const looksLikeCsrfFailure =
      response.status === 403 &&
      typeof responseBody?.detail === "string" &&
      responseBody.detail.toLowerCase().includes("csrf");
    if (looksLikeCsrfFailure && !isRetry) {
      await refreshCsrfToken();
      return request<T>(path, options, true);
    }
    throw new ApiError(response.status, responseBody);
  }

  return responseBody as T;
}

/**
 * Multipart write with upload progress. `fetch()` cannot report how much of
 * a request body has been sent, so this one path uses XMLHttpRequest — the
 * only reason it exists.
 *
 * Needed because the Site Images groups send up to fourteen files in one
 * request: even after client-side compression (dashboard/lib/
 * imageCompression.ts) that is a payload big enough that a spinner with no
 * numbers reads as a hang. Everything else — CSRF header, credentials, the
 * ApiError shape, the one retry on a CSRF failure — matches `request()`
 * exactly so callers cannot tell the two apart.
 */
export async function uploadFormData<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT",
  body: FormData,
  onProgress?: (fraction: number) => void,
  isRetry = false,
): Promise<T> {
  const url = resolveUrl(path);
  const csrfToken = await getCsrfToken();

  const result = await new Promise<{ status: number; body: ApiErrorBody | null }>(
    (resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.withCredentials = true;
      xhr.setRequestHeader(CSRF_HEADER, csrfToken);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            onProgress(Math.min(1, event.loaded / event.total));
          }
        };
        xhr.upload.onload = () => onProgress(1);
      }

      xhr.onload = () => {
        let parsed: ApiErrorBody | null = null;
        try {
          parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
        } catch {
          parsed = null;
        }
        resolve({ status: xhr.status, body: parsed });
      };
      xhr.onerror = () => reject(new TypeError("Network request failed"));
      xhr.onabort = () => reject(new TypeError("Upload aborted"));

      xhr.send(body);
    },
  );

  if (result.status === 204) return undefined as T;

  if (result.status < 200 || result.status >= 300) {
    const looksLikeCsrfFailure =
      result.status === 403 &&
      typeof result.body?.detail === "string" &&
      result.body.detail.toLowerCase().includes("csrf");
    if (looksLikeCsrfFailure && !isRetry) {
      await refreshCsrfToken();
      return uploadFormData<T>(path, method, body, onProgress, true);
    }
    throw new ApiError(result.status, result.body);
  }

  return result.body as T;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};

/**
 * Shape shared by `apiClient` (same-origin, used everywhere by default) and
 * `lib/publicClient.ts`'s `publicClient` (the backend's real origin, for the
 * public site's anonymous-safe reads). A read function that takes this as an
 * optional parameter works unchanged for both callers — see
 * `getGeneralInformation` for the pattern.
 */
export type GetClient = {
  get<T>(path: string, query?: RequestOptions["query"]): Promise<T>;
};

/**
 * Builds multipart FormData for the endpoints that require it (every
 * endpoint with a file field). `string[]` values (Services' problems/
 * procedures) are JSON-encoded — DRF's JSONField accepts a JSON-encoded
 * string body part over multipart the same way it accepts a native array
 * over application/json. `undefined`/`null` values are skipped entirely so
 * PATCH-style partial updates never overwrite a field the caller didn't
 * intend to touch; pass an explicit empty string to clear a text field.
 */
export function toFormData(
  fields: Record<
    string,
    string | number | boolean | File | string[] | null | undefined
  >,
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}
