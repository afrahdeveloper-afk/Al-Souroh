import { useEffect, useState } from 'react';
import type { Paginated } from '../dashboard/types';

/**
 * Shared fetch-on-mount hook for the public portfolio pages now reading the
 * real Souroh Dashboard API (all GET endpoints are public/anonymous per the
 * OpenAPI spec — see CLAUDE.md's "Portfolio-side API wiring" note). Kept
 * intentionally minimal: no caching, no retries beyond what apiClient itself
 * already does for CSRF — just the loading/data/error triad every page here
 * needs, so six pages don't each hand-roll the same three `useState` calls.
 */
export function useApiResource<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error };
}

/**
 * Walks every page of a paginated list endpoint and returns the flattened
 * results. The public pages have no pagination UI of their own (filters run
 * client-side over the full catalogue, matching the pre-API mock data's
 * shape), and every real catalogue here (services/projects/news/categories)
 * is small enough that fetching it whole is the simplest correct behavior.
 */
export async function fetchAllPages<T>(fetchPage: (page: number) => Promise<Paginated<T>>): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  while (true) {
    const response = await fetchPage(page);
    results.push(...response.results);
    if (!response.next) break;
    page += 1;
  }
  return results;
}
