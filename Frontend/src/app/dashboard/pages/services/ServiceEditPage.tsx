import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../../components/ui/button';
import { useLang } from '../../../providers/LanguageProvider';
import { ServiceForm } from './ServiceForm';
import { getService, updateService } from '../../services/services';
import { ApiError, type Service, type ServiceInput } from '../../types';

/**
 * Edit Service — same full-page pattern as Add (figma-spec.md §1.5).
 * Figma's own Edit screen has no distinct design from Add (§1.6: no
 * pre-fill, no "Save changes" wording) — `ServiceForm` pre-fills every
 * field from the real record instead, per the spec's own recommendation
 * to follow ordinary edit-form convention rather than the static mock.
 * Route: /dashboard/services/:id/edit (App.tsx already wired).
 *
 * Wired to the real backend: fetches the service by id via `getService`
 * (route params are always strings — `id` is converted with `Number()`
 * before the call, since the API's `Service.id` is a plain integer) and
 * saves via `updateService`, which accepts a partial `ServiceInput` — the
 * image is only sent if the admin picked a new one, otherwise the current
 * image is left untouched server-side.
 */
type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export function ServiceEditPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const serviceId = id ? Number(id) : NaN;

  const [service, setService] = React.useState<Service | null>(null);
  const [loadState, setLoadState] = React.useState<LoadState>('loading');
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    if (!Number.isFinite(serviceId)) {
      setLoadState('not-found');
      return;
    }

    let cancelled = false;
    setLoadState('loading');

    getService(serviceId)
      .then((result) => {
        if (cancelled) return;
        setService(result);
        setLoadState('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setLoadState('not-found');
        } else {
          setLoadState('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, reloadToken]);

  if (loadState === 'loading') {
    return (
      <DashboardShell>
        <Container width="comfortable" className="flex flex-col gap-dashboard-4 py-dashboard-6">
          <PageHeader title={t('تعديل الخدمة', 'Edit Service')} />
          <p className="text-dashboard-table-body text-dashboard-muted-foreground">
            {t('جارٍ تحميل بيانات الخدمة...', 'Loading service data...')}
          </p>
        </Container>
      </DashboardShell>
    );
  }

  if (loadState === 'error') {
    return (
      <DashboardShell>
        <Container width="comfortable" className="flex flex-col gap-dashboard-4 py-dashboard-6">
          <PageHeader title={t('تعذر تحميل الخدمة', 'Could Not Load Service')} />
          <p className="text-dashboard-table-body text-dashboard-muted-foreground">
            {t('حدث خطأ أثناء تحميل بيانات الخدمة.', 'Something went wrong while loading this service.')}
          </p>
          <Button
            type="button"
            variant="outline"
            size="dashboard"
            className="w-fit"
            onClick={() => setReloadToken((n) => n + 1)}
          >
            {t('إعادة المحاولة', 'Retry')}
          </Button>
        </Container>
      </DashboardShell>
    );
  }

  if (loadState === 'not-found' || !service) {
    return (
      <DashboardShell>
        <Container width="comfortable" className="flex flex-col gap-dashboard-4 py-dashboard-6">
          <PageHeader title={t('الخدمة غير موجودة', 'Service Not Found')} />
          <p className="text-dashboard-table-body text-dashboard-muted-foreground">
            {t(
              'تعذر العثور على هذه الخدمة، ربما تم حذفها.',
              'This service could not be found — it may have been deleted.',
            )}
          </p>
          <Button asChild variant="outline" size="dashboard" className="w-fit">
            <Link to="/dashboard/services">{t('العودة إلى قائمة الخدمات', 'Back to Services')}</Link>
          </Button>
        </Container>
      </DashboardShell>
    );
  }

  const handleSubmit = async (input: ServiceInput) => {
    try {
      const updated = await updateService(service.id, input);
      toast.success(t(`تم حفظ "${updated.service_name_ar}"`, `"${updated.service_name}" was saved`));
      navigate('/dashboard/services');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('تعذر حفظ الخدمة، حاول مرة أخرى.', 'Could not save the service, please try again.');
      toast.error(message);
    }
  };

  return (
    <DashboardShell>
      <Container width="comfortable" className="flex flex-col gap-dashboard-6 py-dashboard-6">
        <PageHeader title={t('تعديل الخدمة', 'Edit Service')} />
        <ServiceForm initialService={service} onSubmit={handleSubmit} />
      </Container>
    </DashboardShell>
  );
}
