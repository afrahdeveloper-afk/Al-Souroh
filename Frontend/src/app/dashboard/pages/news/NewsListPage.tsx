import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Newspaper, Star } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { ListToolbar } from '../../components/ListToolbar';
import { RowActions } from '../../components/RowActions';
import { ArticleForm } from './ArticleForm';
import { useLang } from '../../../providers/LanguageProvider';
import { fetchAllPages } from '../../../lib/publicApi';
import { createNews, deleteNews, listNews, setNewsFeatured, updateNews } from '../../services/news';
import { ApiError, type News, type NewsInput } from '../../types';

/**
 * News & Articles List (figma-spec.md §6.4, route `/dashboard/news`). Add/
 * Edit is a centered modal here (per §1.5 — News/Projects use a modal,
 * unlike Services' full-page pattern), sharing one `ArticleForm` body.
 *
 * Wired to the real `/api/news/` endpoints (`services/news.ts`) — this file
 * no longer reads or writes `features/news/data.ts` (the PUBLIC `/news`
 * page's mock data source) in any way; that file is out of scope for this
 * pass and stays untouched. Listing, search, and pagination all go through
 * the server (`listNews({ page, search })`); Add/Edit/Delete call
 * `createNews`/`updateNews`/`deleteNews` directly and refetch the current
 * page afterward — there is no local mirror of server state to keep in
 * sync.
 *
 * The real `News` schema has no `category` field, so unlike the Services
 * list this table has nothing to show in a Category column — it never had
 * one to begin with in Figma, this is not a removal.
 *
 * The backend gained a real `is_featured` boolean (see CLAUDE.md's section
 * log entry for this pass). At most one article is ever featured — clicking
 * a row's star assigns it as featured and un-features whatever else was
 * featured before it, in that order; clicking an already-featured row's own
 * star un-features it, so "no featured article" is also a valid, reachable
 * state. Mutual exclusivity is enforced client-side (`toggleFeatured` below)
 * rather than assumed from the current page's own rows, since the
 * previously-featured article may sit on a different page than the one
 * being newly featured.
 *
 * Table columns are authored in RTL reading-start-to-end order (Content →
 * Short description → Featured → Actions), matching the Services list's own
 * column order; the browser's native table column reversal for `dir="rtl"`
 * (inherited from `html[dir]` via `LanguageProvider`) places Content at the
 * visual right edge (reading-start) and Actions at the visual left
 * (reading-end), and mirrors correctly for English without any manual
 * per-direction duplication.
 */
const DEFAULT_ENTITY_LABEL = { ar: 'الخبر', en: 'News item' };
const SEARCH_DEBOUNCE_MS = 350;

export function NewsListPage() {
  const { t } = useLang();

  const [articles, setArticles] = useState<News[]>([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [togglingFeaturedId, setTogglingFeaturedId] = useState<number | null>(null);
  const submitPendingRef = useRef(false);
  const togglingFeaturedRef = useRef(false);

  const editingArticle = editingId
    ? articles.find((article) => article.id === editingId) ?? null
    : null;

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await listNews({ page, search: search || undefined });
      setArticles(data.results);
      setCount(data.count);
      setNextPage(data.next);
      setPreviousPage(data.previous);
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const openAdd = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (id: number) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSubmitting) return;
    setFormOpen(false);
    setEditingId(null);
  };

  const errorMessage = (error: unknown, fallbackAr: string, fallbackEn: string) =>
    error instanceof ApiError ? error.message : t(fallbackAr, fallbackEn);

  const handleSubmit = async (input: NewsInput) => {
    if (submitPendingRef.current) return;
    submitPendingRef.current = true;
    setIsSubmitting(true);
    try {
      if (editingArticle) {
        await updateNews(editingArticle.id, input);
        toast.success(t('تم حفظ التعديلات بنجاح', 'Changes saved successfully'));
      } else {
        await createNews(input as Required<NewsInput>);
        toast.success(t('تمت إضافة المحتوى بنجاح', 'Content added successfully'));
      }
      setFormOpen(false);
      setEditingId(null);
      await fetchNews();
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'تعذر حفظ الخبر. حاول مرة أخرى.',
          'Could not save the news item. Please try again.',
        ),
      );
    } finally {
      submitPendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (article: News) => {
    try {
      await deleteNews(article.id);
      toast.success(t(`تم حذف "${article.news_title_ar}"`, `"${article.news_title}" was deleted`));
      await fetchNews();
    } catch (error) {
      toast.error(
        errorMessage(error, 'تعذر الحذف. حاول مرة أخرى.', 'Could not delete. Please try again.'),
      );
    }
  };

  const toggleFeatured = async (article: News) => {
    if (togglingFeaturedRef.current) return;
    togglingFeaturedRef.current = true;
    const nextFeatured = !article.is_featured;
    setTogglingFeaturedId(article.id);
    try {
      if (nextFeatured) {
        const all = await fetchAllPages<News>((p) => listNews({ page: p }));
        const previouslyFeatured = all.find((item) => item.is_featured && item.id !== article.id);
        if (previouslyFeatured) {
          await setNewsFeatured(previouslyFeatured.id, false);
        }
      }
      await setNewsFeatured(article.id, nextFeatured);
      await fetchNews();
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          'تعذر تحديث حالة التمييز. حاول مرة أخرى.',
          'Could not update the featured status. Please try again.',
        ),
      );
    } finally {
      togglingFeaturedRef.current = false;
      setTogglingFeaturedId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="flex flex-col gap-dashboard-6">
        <Container width="comfortable" className="flex flex-col gap-dashboard-6 px-0">
          <PageHeader title={t('الأخبار والمقالات', 'News & Articles')} />

          <ListToolbar
            addLabel={t('+ إضافة خبر / مقال', '+ Add News/Article')}
            onAdd={openAdd}
            searchPlaceholder={t('البحث في الأخبار والمقالات...', 'Search news & articles...')}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            itemCountLabel={t(`${count} عناصر`, `${count} items`)}
          />

          <div className="overflow-hidden border border-dashboard-border">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border hover:bg-transparent">
                  <TableHead>{t('المحتوى', 'Content')}</TableHead>
                  <TableHead>{t('الوصف المختصر', 'Short description')}</TableHead>
                  <TableHead>{t('مميز', 'Featured')}</TableHead>
                  <TableHead className="text-end">{t('إجراءات', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-32 text-center text-dashboard-muted-foreground">
                      {t('جاري التحميل...', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : loadError ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-dashboard-3">
                        <span className="text-dashboard-muted-foreground">
                          {t('تعذر تحميل الأخبار والمقالات.', 'Could not load news & articles.')}
                        </span>
                        <Button type="button" variant="outline" size="dashboard" onClick={fetchNews}>
                          {t('إعادة المحاولة', 'Retry')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : articles.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="h-32 whitespace-normal text-center text-dashboard-muted-foreground"
                    >
                      {t('لا توجد نتائج مطابقة.', 'No matching results.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article.id} className="border-dashboard-border">
                      <TableCell>
                        <div className="flex items-center gap-dashboard-3">
                          {article.news_img ? (
                            <img
                              src={article.news_img}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-[42px] w-[62px] shrink-0 border border-dashboard-border object-cover"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="flex h-[42px] w-[62px] shrink-0 items-center justify-center border border-dashboard-border bg-dashboard-surface-sunken text-dashboard-placeholder-foreground"
                            >
                              <Newspaper className="size-4" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-dashboard-foreground">{article.news_title_ar}</span>
                            <span
                              dir="ltr"
                              lang="en"
                              className="truncate text-dashboard-table-subtitle text-dashboard-faint-foreground"
                            >
                              {article.news_title}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[420px] whitespace-normal">
                        <span className="line-clamp-2 text-dashboard-muted-foreground">
                          {article.news_description_ar}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="dashboardIcon"
                          disabled={togglingFeaturedId !== null}
                          aria-pressed={article.is_featured}
                          aria-label={
                            article.is_featured
                              ? t('إلغاء التمييز', 'Remove featured status')
                              : t('تعيين كمميز', 'Set as featured')
                          }
                          onClick={() => toggleFeatured(article)}
                          className={
                            article.is_featured
                              ? 'text-dashboard-primary'
                              : 'text-dashboard-faint-foreground hover:text-dashboard-primary-hover'
                          }
                        >
                          {togglingFeaturedId === article.id ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Star
                              className="size-4"
                              fill={article.is_featured ? 'currentColor' : 'none'}
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end">
                          <RowActions
                            onEdit={() => openEdit(article.id)}
                            entityLabelAr={DEFAULT_ENTITY_LABEL.ar}
                            entityLabelEn={DEFAULT_ENTITY_LABEL.en}
                            itemName={article.news_title_ar}
                            onDelete={() => handleDelete(article)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <span dir="ltr" className="tabular-latin text-dashboard-table-header text-dashboard-faint-foreground">
              {t(`صفحة ${page}`, `Page ${page}`)}
            </span>
            <div className="flex items-center gap-dashboard-2">
              <Button
                type="button"
                variant="outline"
                size="dashboard"
                disabled={!previousPage || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {t('السابق', 'Previous')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="dashboard"
                disabled={!nextPage || isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                {t('التالي', 'Next')}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) closeForm();
          else setFormOpen(true);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-[724px] overflow-y-auto">
          <DialogHeader>
            <span
              dir="ltr"
              lang="en"
              className="text-dashboard-eyebrow-sm uppercase tracking-dashboard-wordmark text-dashboard-primary"
            >
              {editingArticle ? 'EDIT CONTENT' : 'NEW CONTENT'}
            </span>
            <DialogTitle>
              {editingArticle
                ? t('تعديل الخبر / المقال', 'Edit news / article')
                : t('إضافة خبر / مقال جديد', 'Add new news / article')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'املأ الحقول أدناه باللغتين لعرض المحتوى في صفحة الأخبار والمقالات.',
                'Fill in the fields below in both languages to publish this content on the News & Articles page.',
              )}
            </DialogDescription>
          </DialogHeader>

          <ArticleForm
            key={editingArticle?.id ?? 'new'}
            initialArticle={editingArticle}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
