import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { DashboardShell } from '../../layouts/DashboardShell';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { useLang } from '../../../providers/LanguageProvider';
import { ServiceForm } from './ServiceForm';
import { createService } from '../../services/services';
import { ApiError, type ServiceInput } from '../../types';

/**
 * Add Service — full page, not a modal (figma-spec.md §1.5: Services'
 * Add/Edit is one of the "full page" flows, unlike Projects/News' modal
 * pattern). Route: /dashboard/services/new (App.tsx already wired).
 *
 * Wired to the real backend via `createService`. `ServiceForm` refuses to
 * call `onSubmit` at all unless an image file was picked (createService
 * expects `Required<ServiceInput>` — img is mandatory on create), so the
 * cast below is safe by construction rather than an unchecked assumption.
 */
export function ServiceAddPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (input: ServiceInput) => {
    try {
      const created = await createService(input as Required<ServiceInput>);
      toast.success(t(`تمت إضافة "${created.service_name_ar}"`, `"${created.service_name}" was added`));
      navigate('/dashboard/services');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t('تعذر إضافة الخدمة، حاول مرة أخرى.', 'Could not add the service, please try again.');
      toast.error(message);
    }
  };

  return (
    <DashboardShell>
      <Container width="comfortable" className="flex flex-col gap-dashboard-6 py-dashboard-6">
        <PageHeader title={t('إضافة خدمة جديدة', 'Add New Service')} />
        <ServiceForm onSubmit={handleSubmit} />
      </Container>
    </DashboardShell>
  );
}
