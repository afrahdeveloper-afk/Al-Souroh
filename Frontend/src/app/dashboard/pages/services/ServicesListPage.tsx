import * as React from 'react';
import { toast } from 'sonner';

import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { ListToolbar } from '../../components/ListToolbar';
import { RowActions } from '../../components/RowActions';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useLang } from '../../../providers/LanguageProvider';
import { deleteService, listServices, sortServicesByPriority } from '../../services/services';
import { ApiError, type Paginated, type Service } from '../../types';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Services List (figma-spec.md §6.2, built against the visible `40:27352`
 * table design). Columns: Content (thumbnail + AR title + EN subtitle),
 * Short description (truncated), Category (plain text, now `service_rank`/
 * `service_rank_ar` — the real backend has no category taxonomy), Actions.
 *
 * Wired to the real backend: search is a server-side `?search=` query
 * (debounced ~350ms, resets to page 1 on change) instead of a client-side
 * `.filter()`, and Previous/Next pagination reads the response's own
 * `next`/`previous` cursors rather than assuming a fixed page count.
 */
export function ServicesListPage() {
  const { t, isAr } = useLang();

  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [reloadToken, setReloadToken] = React.useState(0);

  const [data, setData] = React.useState<Paginated<Service> | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');

  React.useEffect(() => {
    const handle = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    listServices({ search: search || undefined, page })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, reloadToken]);

  const handleRetry = () => setReloadToken((n) => n + 1);

  const handleDelete = async (service: Service) => {
    try {
      await deleteService(service.id);
      toast.success(t(`تم حذف "${service.service_name_ar}"`, `"${service.service_name}" was deleted`));
      if (data && data.results.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setReloadToken((n) => n + 1);
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('تعذر حذف الخدمة، حاول مرة أخرى.', 'Could not delete the service, please try again.');
      toast.error(message);
    }
  };

  const results = sortServicesByPriority(data?.results ?? []);

  return (
    <DashboardShell>
      <Container width="comfortable" className="flex flex-col gap-dashboard-6 py-dashboard-6">
        <PageHeader title={t('الخدمات', 'Services')} />

        <ListToolbar
          addLabel={t('+ إضافة خدمة', '+ Add Service')}
          addTo="/dashboard/services/new"
          searchPlaceholder={t('البحث في الخدمات...', 'Search services...')}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          itemCountLabel={data ? t(`${data.count} عنصر`, `${data.count} items`) : undefined}
        />

        <div className="border border-dashboard-border">
          <Table>
            <TableHeader>
              <TableRow className="border-dashboard-border hover:bg-transparent">
                <TableHead className="text-dashboard-table-header text-dashboard-faint-foreground">
                  {t('المحتوى', 'Content')}
                </TableHead>
                <TableHead className="text-dashboard-table-header text-dashboard-faint-foreground">
                  {t('الوصف المختصر', 'Short Description')}
                </TableHead>
                <TableHead className="text-dashboard-table-header text-dashboard-faint-foreground">
                  {t('التصنيف', 'Category')}
                </TableHead>
                <TableHead className="text-dashboard-table-header text-dashboard-faint-foreground">
                  {t('الترتيب', 'Order')}
                </TableHead>
                <TableHead className="text-end text-dashboard-table-header text-dashboard-faint-foreground">
                  {t('إجراءات', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status === 'loading' && (
                <TableRow className="border-dashboard-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-dashboard-10 text-center text-dashboard-table-body text-dashboard-muted-foreground">
                    {t('جارٍ التحميل...', 'Loading...')}
                  </TableCell>
                </TableRow>
              )}

              {status === 'error' && (
                <TableRow className="border-dashboard-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-dashboard-10">
                    <div className="flex flex-col items-center gap-dashboard-3 text-center">
                      <p className="text-dashboard-table-body text-dashboard-muted-foreground">
                        {t('تعذر تحميل الخدمات.', 'Could not load services.')}
                      </p>
                      <Button type="button" variant="outline" size="dashboard" onClick={handleRetry}>
                        {t('إعادة المحاولة', 'Retry')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {status === 'ready' && results.length === 0 && (
                <TableRow className="border-dashboard-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-dashboard-10 text-center text-dashboard-table-body text-dashboard-muted-foreground">
                    {t('لا توجد خدمات مطابقة لبحثك.', 'No services match your search.')}
                  </TableCell>
                </TableRow>
              )}

              {status === 'ready' &&
                results.map((service) => {
                  const title = isAr ? service.service_name_ar : service.service_name;
                  const subtitle = service.service_name;
                  const description = isAr ? service.service_description_ar : service.service_description;
                  const category = isAr ? service.service_rank_ar : service.service_rank;

                  return (
                    <TableRow key={service.id} className="border-dashboard-border">
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-dashboard-3">
                          <img
                            src={service.img}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                            className="size-12 shrink-0 object-cover"
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-dashboard-table-body text-dashboard-foreground">{title}</span>
                            <span dir="ltr" lang="en" className="truncate text-dashboard-table-subtitle text-dashboard-faint-foreground">
                              {subtitle}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[360px] truncate text-dashboard-table-body text-dashboard-muted-foreground">
                        {description}
                      </TableCell>
                      <TableCell className="text-dashboard-table-body text-dashboard-muted-foreground">
                        {category || t('—', '—')}
                      </TableCell>
                      <TableCell className="text-dashboard-table-body text-dashboard-muted-foreground">
                        {service.service_priority === undefined ? (
                          '—'
                        ) : (
                          <span dir="ltr" className="tabular-latin">{service.service_priority}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end">
                          <RowActions
                            editTo={`/dashboard/services/${service.id}/edit`}
                            entityLabelAr="الخدمة"
                            entityLabelEn="Service"
                            itemName={isAr ? service.service_name_ar : service.service_name}
                            onDelete={() => handleDelete(service)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-dashboard-4">
          <span dir="ltr" className="tabular-latin text-dashboard-table-header text-dashboard-faint-foreground">
            {t(`صفحة ${page}`, `Page ${page}`)}
          </span>
          <div className="flex items-center gap-dashboard-2">
            <Button
              type="button"
              variant="outline"
              size="dashboard"
              disabled={!data?.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('السابق', 'Previous')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="dashboard"
              disabled={!data?.next}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('التالي', 'Next')}
            </Button>
          </div>
        </div>
      </Container>
    </DashboardShell>
  );
}
