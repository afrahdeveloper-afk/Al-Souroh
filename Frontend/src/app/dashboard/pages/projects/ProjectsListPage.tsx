import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { ListToolbar } from '../../components/ListToolbar';
import { RowActions } from '../../components/RowActions';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useLang } from '../../../providers/LanguageProvider';

import { createProject, deleteProject, listProjects, updateProject } from '../../services/projects';
import { ApiError, type Project, type ProjectInput } from '../../types';
import {
  ProjectForm,
  type ProjectFormValues,
  type ProjectImageFiles,
  type ProjectImagePreviews,
} from './ProjectForm';
import { useProjectCategories } from './projectCategoriesStore';

/**
 * Projects List (figma-spec.md §6.3, `12:11716`) — toolbar (search + "+ Add
 * Project" + a secondary "+ Add Category" shortcut to the Categories
 * screen, per the spec's documented duplicate-button pattern) above a
 * 4-column table, with the Add/Edit form living in a centered `Dialog`
 * (§1.5: Projects' Add/Edit is a modal, unlike Services' full-page pattern).
 *
 * Rewired to the real API (`services/projects.ts`) — replaces the old
 * local `useState` array seeded from the public page's mock data.
 * `?search=` is server-side and debounced ~350ms (resetting to page 1 on
 * every new query, matching the standard "new search invalidates the old
 * page position" convention), and pagination is a plain Previous/Next pair
 * built off the response's `count`/`next`/`previous` — the API's own
 * cursor/offset paging, not a client-side slice.
 *
 * `Project` already embeds `category_name`/`category_name_ar` on every row
 * (the backend denormalizes it), so the table's Category column reads
 * straight off the project — no need to cross-reference the categories
 * list for display. The categories list (`useProjectCategories`) is only
 * needed to populate the Add/Edit form's category `Select`.
 */
export function ProjectsListPage() {
  const { t, isAr } = useLang();
  const { categories, isLoading: categoriesLoading } = useProjectCategories();

  const [projects, setProjects] = useState<Project[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState<unknown>(null);

  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitPendingRef = useRef(false);

  const editingProject = editingId != null ? projects.find((p) => p.id === editingId) ?? null : null;

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await listProjects({ page, search: debouncedSearch || undefined });
      setProjects(response.results);
      setCount(response.count);
      setNext(response.next);
      setPrevious(response.previous);
    } catch (err) {
      setListError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const closeForm = () => {
    if (isSubmitting) return;
    setFormMode(null);
    setEditingId(null);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormMode('add');
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormMode('edit');
  };

  const handleDelete = async (project: Project) => {
    const name = isAr ? project.project_name_ar : project.project_name;
    try {
      await deleteProject(project.id);
      toast.success(t(`تم حذف "${name}"`, `"${name}" deleted`));
      fetchProjects();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : t(`تعذر حذف "${name}"`, `Could not delete "${name}"`),
      );
    }
  };

  const handleSubmit = async (values: ProjectFormValues, images: ProjectImageFiles) => {
    if (submitPendingRef.current) return;
    submitPendingRef.current = true;
    const input: ProjectInput = {
      category: values.category,
      project_name: values.titleEn,
      project_name_ar: values.titleAr,
      car_model: values.model,
      date: values.date,
      project_description: values.summaryEn,
      project_description_ar: values.summaryAr,
    };
    if (images.coverImage) input.cover_img = images.coverImage;
    if (images.beforeImage) input.before_img = images.beforeImage;
    if (images.afterImage) input.after_img = images.afterImage;

    setIsSubmitting(true);
    try {
      if (formMode === 'edit' && editingProject) {
        await updateProject(editingProject.id, input);
        toast.success(t('تم حفظ تعديلات المشروع', 'Project changes saved'));
      } else {
        await createProject(input);
        toast.success(t('تمت إضافة المشروع بنجاح', 'Project added successfully'));
      }
      setFormMode(null);
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : t('حدث خطأ أثناء حفظ المشروع', 'Something went wrong while saving the project'),
      );
    } finally {
      submitPendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const toFormValues = (project: Project): ProjectFormValues => ({
    titleAr: project.project_name_ar,
    titleEn: project.project_name,
    category: project.category,
    date: project.date,
    model: project.car_model,
    summaryAr: project.project_description_ar,
    summaryEn: project.project_description,
  });

  const toImagePreviews = (project: Project): ProjectImagePreviews => ({
    coverImage: project.cover_img,
    beforeImage: project.before_img,
    afterImage: project.after_img,
  });

  return (
    <DashboardShell>
      <Container width="comfortable" className="flex flex-col gap-dashboard-8">
        <PageHeader title={t('المشاريع', 'Projects')} />

        <ListToolbar
          addLabel={t('+ إضافة مشروع', '+ Add Project')}
          onAdd={handleAdd}
          searchPlaceholder={t('البحث في المشاريع...', 'Search projects...')}
          searchValue={search}
          onSearchChange={setSearch}
          itemCountLabel={t(`${count} عناصر`, `${count} items`)}
          secondaryAction={
            <Button asChild variant="outline" size="dashboard">
              <Link to="/dashboard/projects/categories">
                {t('+ إضافة تصنيف', '+ Add Category')}
              </Link>
            </Button>
          }
        />

        <div className="border border-dashboard-border">
          <Table>
            <TableHeader>
              <TableRow className="border-dashboard-border hover:bg-transparent">
                <TableHead>{t('المحتوى', 'Content')}</TableHead>
                <TableHead>{t('التصنيف', 'Category')}</TableHead>
                <TableHead>{t('المركبة / التاريخ', 'Vehicle / Date')}</TableHead>
                <TableHead className="text-end">{t('إجراءات', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="whitespace-normal py-dashboard-12 text-center text-dashboard-muted-foreground">
                    {t('جارٍ التحميل...', 'Loading...')}
                  </TableCell>
                </TableRow>
              ) : listError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="whitespace-normal py-dashboard-12 text-center">
                    <div className="flex flex-col items-center gap-dashboard-3">
                      <span className="text-dashboard-muted-foreground">
                        {t('تعذر تحميل المشاريع', 'Could not load projects')}
                      </span>
                      <Button type="button" variant="outline" size="dashboard" onClick={fetchProjects}>
                        {t('إعادة المحاولة', 'Retry')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className="whitespace-normal py-dashboard-12 text-center text-dashboard-muted-foreground">
                    {t('لا توجد مشاريع مطابقة لبحثك', 'No projects match your search')}
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const title = isAr ? project.project_name_ar : project.project_name;
                  const categoryLabel = isAr ? project.category_name_ar : project.category_name;
                  return (
                    <TableRow key={project.id} className="border-dashboard-border">
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-dashboard-3">
                          {project.cover_img ? (
                            <img
                              src={project.cover_img}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-[42px] w-[62px] shrink-0 object-cover"
                            />
                          ) : (
                            <div className="h-[42px] w-[62px] shrink-0 bg-dashboard-surface-sunken" />
                          )}
                          <div className="flex flex-col gap-dashboard-1">
                            <span className="text-dashboard-foreground">{title}</span>
                            <span dir="ltr" lang="en" className="text-dashboard-table-subtitle text-dashboard-faint-foreground">
                              {project.project_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal text-dashboard-muted-foreground">
                        {categoryLabel}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="flex flex-col gap-dashboard-1">
                          <span className="text-dashboard-foreground-secondary">{project.car_model}</span>
                          <span dir="ltr" className="tabular-latin text-dashboard-table-subtitle text-dashboard-faint-foreground">
                            {project.date}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end">
                          <RowActions
                            onEdit={() => handleEdit(project)}
                            entityLabelAr="المشروع"
                            entityLabelEn="Project"
                            itemName={project.project_name_ar}
                            onDelete={() => handleDelete(project)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && !listError && (previous || next) && (
          <div className="flex items-center justify-between gap-dashboard-4">
            <span dir="ltr" className="tabular-latin text-dashboard-table-header text-dashboard-faint-foreground">
              {`Page ${page} · ${count} items`}
            </span>
            <div className="flex items-center gap-dashboard-2">
              <Button
                type="button"
                variant="outline"
                size="dashboard"
                disabled={!previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {isAr ? <ChevronRight className="size-4" aria-hidden="true" /> : <ChevronLeft className="size-4" aria-hidden="true" />}
                {t('السابق', 'Previous')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="dashboard"
                disabled={!next}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('التالي', 'Next')}
                {isAr ? <ChevronLeft className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4" aria-hidden="true" />}
              </Button>
            </div>
          </div>
        )}
      </Container>

      {formMode && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[708px]">
            <DialogHeader>
              <span dir="ltr" lang="en" className="text-dashboard-eyebrow-lg uppercase text-dashboard-primary">
                {formMode === 'edit' ? 'EDIT PROJECT' : 'NEW PROJECT'}
              </span>
              <DialogTitle>
                {formMode === 'edit' ? t('تعديل المشروع', 'Edit Project') : t('إضافة مشروع جديد', 'Add a New Project')}
              </DialogTitle>
              <DialogDescription>
                {t('أدخل تفاصيل المشروع والصور المرتبطة به.', 'Enter the project details and its related photos.')}
              </DialogDescription>
            </DialogHeader>

            <ProjectForm
              key={editingProject ? editingProject.id : 'add'}
              categories={categories}
              categoriesLoading={categoriesLoading}
              initialValues={editingProject ? toFormValues(editingProject) : undefined}
              initialImages={editingProject ? toImagePreviews(editingProject) : undefined}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </DashboardShell>
  );
}
