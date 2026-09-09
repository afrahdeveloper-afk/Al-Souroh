import * as React from 'react';
import { useRef, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { RowActions } from '../../components/RowActions';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useLang } from '../../../providers/LanguageProvider';
import { ApiError } from '../../types';

import {
  addProjectCategory,
  removeProjectCategory,
  updateProjectCategory,
  useProjectCategories,
  type ProjectCategory,
} from './projectCategoriesStore';

/**
 * Projects → Categories (figma-spec.md §6.3, `44:34232`) — the third of the
 * three interaction patterns the spec's §1.5 documents: an inline
 * (non-modal, non-navigating) add form above a plain list, unlike the
 * Projects List's own modal Add/Edit. Edit is handled the same inline way
 * (Figma only designed Add for this screen — §1.6 — so the Edit row here
 * follows the same inline convention rather than inventing a second,
 * inconsistent pattern such as a modal).
 *
 * Rewired to the real API: `useProjectCategories` fetches every page up
 * front (see `projectCategoriesStore.ts`'s own comment for why — the
 * category count is small enough that a management screen like this one
 * benefits more from a always-complete list than from paging through it)
 * rather than assuming a single page holds the whole taxonomy. Add/Edit/
 * Delete call the real `create`/`update`/`delete` endpoints and `refetch`
 * the list on success, since this is no longer a shared reactive store —
 * each screen now fetches its own copy from the server.
 *
 * Delete failures are branched: the backend's ONLY documented reason a
 * category delete can fail (Souroh Dashboard API.yaml's `PROTECT`
 * constraint — a category still referenced by projects) surfaces here as
 * an `ApiError`, so any `ApiError` on delete is shown as that specific,
 * actionable message rather than a generic failure toast; a non-`ApiError`
 * (e.g. a network failure before a response was even received) falls back
 * to a generic message instead.
 */
export function ProjectCategoriesPage() {
  const { t } = useLang();
  const { categories, isLoading, error, refetch } = useProjectCategories();

  const [isAdding, setIsAdding] = useState(false);
  const [addEn, setAddEn] = useState('');
  const [addAr, setAddAr] = useState('');
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const addPendingRef = useRef(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState('');
  const [editAr, setEditAr] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const editPendingRef = useRef(false);

  const resetAddForm = () => {
    setIsAdding(false);
    setAddEn('');
    setAddAr('');
  };

  const handleAddSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!addAr.trim() || !addEn.trim()) return;
    if (addPendingRef.current) return;
    addPendingRef.current = true;
    setIsAddSubmitting(true);
    try {
      await addProjectCategory({ ar: addAr.trim(), en: addEn.trim() });
      toast.success(t('تمت إضافة التصنيف', 'Category added'));
      resetAddForm();
      refetch();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : t('تعذرت إضافة التصنيف', 'Could not add the category'),
      );
    } finally {
      addPendingRef.current = false;
      setIsAddSubmitting(false);
    }
  };

  const startEditing = (category: ProjectCategory) => {
    setEditingId(category.id);
    setEditAr(category.ar);
    setEditEn(category.en);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditAr('');
    setEditEn('');
  };

  const handleEditSubmit = async (event: React.FormEvent, id: string) => {
    event.preventDefault();
    if (!editAr.trim() || !editEn.trim()) return;
    if (editPendingRef.current) return;
    editPendingRef.current = true;
    setIsEditSubmitting(true);
    try {
      await updateProjectCategory(id, { ar: editAr.trim(), en: editEn.trim() });
      toast.success(t('تم حفظ التصنيف', 'Category saved'));
      cancelEditing();
      refetch();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : t('تعذر حفظ التصنيف', 'Could not save the category'),
      );
    } finally {
      editPendingRef.current = false;
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (category: ProjectCategory) => {
    try {
      await removeProjectCategory(category.id);
      toast.success(t(`تم حذف "${category.ar}"`, `"${category.en}" deleted`));
      refetch();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(
          t(
            `تعذر حذف "${category.ar}" لأنه لا يزال مرتبطاً بمشاريع قائمة. أعد تصنيف أو احذف تلك المشاريع أولاً.`,
            `Can't delete "${category.en}" — it still has projects assigned to it. Reassign or delete those projects first.`,
          ),
        );
      } else {
        toast.error(
          t('حدث خطأ غير متوقع أثناء الحذف', 'An unexpected error occurred while deleting'),
        );
      }
    }
  };

  return (
    <DashboardShell>
      <Container width="content" className="flex flex-col gap-dashboard-8">
        <PageHeader
          title={t('تصنيفات المشاريع', 'Project Categories')}
          actions={
            !isAdding ? (
              <Button type="button" size="dashboard" onClick={() => setIsAdding(true)}>
                {t('+ إضافة التصنيف', '+ Add Category')}
              </Button>
            ) : undefined
          }
        />

        {isAdding && (
          <form
            onSubmit={handleAddSubmit}
            className="flex flex-col gap-dashboard-4 border border-dashboard-border bg-dashboard-surface p-dashboard-6 sm:flex-row sm:items-end"
          >
            <div className="flex flex-1 flex-col gap-dashboard-2">
              <Label htmlFor="new-category-en">{t('اسم التصنيف (إنجليزي)', 'Category Name (English)')}</Label>
              <Input
                id="new-category-en"
                dir="ltr"
                required
                value={addEn}
                onChange={(event) => setAddEn(event.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-dashboard-2">
              <Label htmlFor="new-category-ar">{t('اسم التصنيف (عربي)', 'Category Name (Arabic)')}</Label>
              <Input
                id="new-category-ar"
                dir="rtl"
                required
                value={addAr}
                onChange={(event) => setAddAr(event.target.value)}
              />
            </div>
            <div className="flex shrink-0 items-center gap-dashboard-3">
              <Button type="submit" size="dashboard" disabled={isAddSubmitting}>
                <Save className="size-4" aria-hidden="true" />
                {isAddSubmitting ? t('جارٍ الإضافة...', 'Adding...') : t('+ إضافة التصنيف', '+ Add Category')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="dashboard"
                onClick={resetAddForm}
                disabled={isAddSubmitting}
              >
                {t('إلغاء', 'Cancel')}
              </Button>
            </div>
          </form>
        )}

        <div className="border border-dashboard-border">
          {isLoading ? (
            <p className="p-dashboard-8 text-center text-dashboard-muted-foreground">
              {t('جارٍ التحميل...', 'Loading...')}
            </p>
          ) : error ? (
            <div className="flex flex-col items-center gap-dashboard-4 p-dashboard-8 text-center">
              <p className="text-dashboard-muted-foreground">
                {t('تعذر تحميل التصنيفات', 'Could not load categories')}
              </p>
              <Button type="button" variant="outline" size="dashboard" onClick={() => refetch()}>
                {t('إعادة المحاولة', 'Retry')}
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <p className="p-dashboard-8 text-center text-dashboard-muted-foreground">
              {t('لا توجد تصنيفات بعد', 'No categories yet')}
            </p>
          ) : (
            <ul>
              {categories.map((category, index) => (
                <li key={category.id} className={index === 0 ? '' : 'border-t border-dashboard-border'}>
                  {editingId === category.id ? (
                    <form
                      onSubmit={(event) => handleEditSubmit(event, category.id)}
                      className="flex flex-col gap-dashboard-4 p-dashboard-4 sm:flex-row sm:items-end"
                    >
                      <div className="flex flex-1 flex-col gap-dashboard-2">
                        <Label htmlFor={`edit-en-${category.id}`}>
                          {t('اسم التصنيف (إنجليزي)', 'Category Name (English)')}
                        </Label>
                        <Input
                          id={`edit-en-${category.id}`}
                          dir="ltr"
                          required
                          value={editEn}
                          onChange={(event) => setEditEn(event.target.value)}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-dashboard-2">
                        <Label htmlFor={`edit-ar-${category.id}`}>
                          {t('اسم التصنيف (عربي)', 'Category Name (Arabic)')}
                        </Label>
                        <Input
                          id={`edit-ar-${category.id}`}
                          dir="rtl"
                          required
                          value={editAr}
                          onChange={(event) => setEditAr(event.target.value)}
                        />
                      </div>
                      <div className="flex shrink-0 items-center gap-dashboard-3">
                        <Button type="submit" size="dashboard" disabled={isEditSubmitting}>
                          <Save className="size-4" aria-hidden="true" />
                          {isEditSubmitting ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ', 'Save')}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="dashboard"
                          onClick={cancelEditing}
                          disabled={isEditSubmitting}
                        >
                          {t('إلغاء', 'Cancel')}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-dashboard-4 p-dashboard-4">
                      <div className="flex flex-col gap-dashboard-1">
                        <span className="text-dashboard-foreground">{category.ar}</span>
                        <span dir="ltr" lang="en" className="text-dashboard-table-subtitle text-dashboard-faint-foreground">
                          {category.en}
                        </span>
                      </div>
                      <RowActions
                        onEdit={() => startEditing(category)}
                        entityLabelAr="التصنيف"
                        entityLabelEn="Category"
                        itemName={category.ar}
                        onDelete={() => handleDelete(category)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </DashboardShell>
  );
}
