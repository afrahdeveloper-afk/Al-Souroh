import { useCallback, useEffect, useState } from 'react';

import {
  createProjectCategory as apiCreateProjectCategory,
  deleteProjectCategory as apiDeleteProjectCategory,
  listProjectCategories,
  updateProjectCategory as apiUpdateProjectCategory,
} from '../../services/projectCategories';
import type { ProjectCategory as ApiProjectCategory, ProjectCategoryInput } from '../../types';

/**
 * Real-backend replacement for the old module-scoped mock store. Kept in
 * this file (same name, same export shape as much as possible) so
 * `ProjectForm`/`ProjectsListPage`/`ProjectCategoriesPage` don't need
 * import-path changes — only the small usage-site changes required by
 * `useProjectCategories` now returning `{ categories, isLoading, error,
 * refetch }` instead of a bare array, and by `add`/`update`/`remove`
 * becoming async (they now hit the real API and can throw `ApiError`,
 * notably on delete when the backend's PROTECT constraint blocks it
 * because projects still reference the category).
 *
 * `ProjectCategory` here stays a small UI-facing `{ id, ar, en }` value
 * object rather than switching every call site to the API's own
 * `category_name`/`category_name_ar` field names — this mirrors the
 * boundary convention `types/index.ts`'s own header comment describes
 * ("UI-facing form types... get mapped to/from these API types at the
 * service-module boundary"), and it means `ProjectForm`'s Select rendering
 * (`t(category.ar, category.en)`) and `ProjectsListPage`'s category-label
 * lookups didn't need to change at all. `id` is now the real UUID instead
 * of a slugified string.
 */
export type ProjectCategory = {
  id: string;
  ar: string;
  en: string;
};

function fromApi(category: ApiProjectCategory): ProjectCategory {
  return { id: category.id, ar: category.category_name_ar, en: category.category_name };
}

function toApiInput(input: { ar: string; en: string }): ProjectCategoryInput {
  return { category_name: input.en, category_name_ar: input.ar };
}

/**
 * Loops through every page the API returns instead of assuming one page
 * holds the whole taxonomy. `ListParams` exposes no page-size override, so
 * this is the only way to get a genuinely complete list for the Project
 * form's Select and for the Categories management screen — it costs a
 * handful of extra requests at the category counts this project actually
 * has (7 on the public site today), and it stays correct instead of
 * silently truncating if the list grows, unlike hardcoding "everything
 * fits on page 1."
 */
async function fetchAllProjectCategories(): Promise<ProjectCategory[]> {
  const all: ProjectCategory[] = [];
  let page = 1;
  for (;;) {
    const response = await listProjectCategories({ page });
    all.push(...response.results.map(fromApi));
    if (!response.next) break;
    page += 1;
  }
  return all;
}

/**
 * Fetch-on-mount + manual `refetch`, backed by the real API. Deliberately
 * a plain hook, not a shared cross-page store: now that the data genuinely
 * lives on the server, each page that calls this fetches its own copy, and
 * navigating between `/dashboard/projects` and `/dashboard/projects/categories`
 * (a remount) is enough to pick up changes made on the other screen.
 * `refetch` lets a page re-sync immediately after its own mutation without
 * requiring a full navigation.
 */
export function useProjectCategories() {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await fetchAllProjectCategories();
      setCategories(all);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, isLoading, error, refetch };
}

export async function addProjectCategory(input: { ar: string; en: string }): Promise<ProjectCategory> {
  const created = await apiCreateProjectCategory(toApiInput(input));
  return fromApi(created);
}

export async function updateProjectCategory(
  id: string,
  patch: { ar: string; en: string },
): Promise<ProjectCategory> {
  const updated = await apiUpdateProjectCategory(id, toApiInput(patch));
  return fromApi(updated);
}

/** Rejects with an ApiError if the backend's PROTECT constraint blocks deletion (category still has projects). */
export function removeProjectCategory(id: string): Promise<void> {
  return apiDeleteProjectCategory(id);
}
