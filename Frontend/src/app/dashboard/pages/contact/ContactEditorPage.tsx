import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw, Save, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { ConfirmSaveDialog } from '../../components/ConfirmSaveDialog';
import { DashboardShell } from '../../layouts/DashboardShell';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useLang } from '../../../providers/LanguageProvider';
import { getContactUs, createContactUs, updateContactUs } from '../../services/contactUs';
import { ApiError, type ContactUs, type ContactUsInput } from '../../types';

/**
 * Contact info editor (figma-spec.md §6.6) — a 300px "Aside" sidebar (static
 * explanatory copy, plus a "last saved" state once a save happens this
 * session) + an 11-field form card. `16:21111` (idle) and `21:24402`
 * (post-save) are NOT two different Figma screens, just one screen's idle
 * vs. post-save state — implemented here as one screen with local state,
 * not two routes, per the spec's own note.
 *
 * Wired to the real singleton `/api/contact-us/` endpoint
 * (`dashboard/services/contactUs.ts`) — CLAUDE.md's Dashboard API section
 * log. This screen is fully independent of the public `ContactPage.tsx`;
 * it neither reads `CONTACT_INFO` nor writes back into it. `getContactUs()`
 * returns `null` on a 404 (no record created yet), in which case the form
 * starts empty and Save uses `createContactUs` (POST) instead of
 * `updateContactUs` (PATCH) — tracked via `hasRecord` below.
 */
const INPUT_CLASS =
  'h-[var(--dashboard-control-height-input)] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30';
const TEXTAREA_CLASS =
  'min-h-[100px] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30';

/** HH:MM via plain zero-padded getHours/getMinutes — never Intl/toLocaleString
 *  with an 'ar' locale, so this can never silently emit Arabic-Indic digits
 *  (Protocol 3, project-wide, not just the public site). */
function formatClock(date: Date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

type FormState = {
  phone: string;
  whatsapp: string;
  email: string;
  mapsHref: string;
  addressEn: string;
  addressAr: string;
  workingDays: string;
  workingDaysAr: string;
  workingHours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
};

const EMPTY_FORM: FormState = {
  phone: '',
  whatsapp: '',
  email: '',
  mapsHref: '',
  addressEn: '',
  addressAr: '',
  workingDays: '',
  workingDaysAr: '',
  workingHours: '',
  instagram: '',
  facebook: '',
  tiktok: '',
};

/** Maps the real API record onto this screen's flat form shape. `email` and
 *  `work_days_ar` are nullable on the backend — no record has to have them. */
function formFromRecord(record: ContactUs): FormState {
  return {
    phone: record.phone_number,
    whatsapp: record.whatsapp_number,
    email: record.email ?? '',
    mapsHref: record.google_map_link,
    addressEn: record.address,
    addressAr: record.address_ar,
    workingDays: record.work_days,
    workingDaysAr: record.work_days_ar ?? '',
    workingHours: record.work_hours,
    instagram: record.instagram_user,
    facebook: record.facebook_user,
    tiktok: record.tiktok_user,
  };
}

/** Maps this screen's flat form shape back onto the real API's field names.
 *  An empty `email`/`workingDaysAr` is sent as `null` (matching their
 *  nullable backend type) rather than an empty string. */
function formToInput(form: FormState): ContactUsInput {
  return {
    phone_number: form.phone,
    whatsapp_number: form.whatsapp,
    email: form.email.trim() ? form.email : null,
    google_map_link: form.mapsHref,
    address: form.addressEn,
    address_ar: form.addressAr,
    work_days: form.workingDays,
    work_days_ar: form.workingDaysAr.trim() ? form.workingDaysAr : null,
    work_hours: form.workingHours,
    instagram_user: form.instagram,
    facebook_user: form.facebook,
    tiktok_user: form.tiktok,
  };
}

function TextField({
  id,
  label,
  value,
  onChange,
  dir,
  type = 'text',
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-dashboard-2">
      <label htmlFor={id} className="text-dashboard-label-en text-dashboard-foreground-secondary">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </div>
  );
}

function TextareaField({
  id,
  label,
  value,
  onChange,
  dir,
  lang,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'ltr' | 'rtl';
  lang?: string;
}) {
  return (
    <div className="flex flex-col gap-dashboard-2">
      <label htmlFor={id} className="text-dashboard-label-en text-dashboard-foreground-secondary">
        {label}
      </label>
      <Textarea
        id={id}
        dir={dir}
        lang={lang}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={TEXTAREA_CLASS}
      />
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="text-dashboard-h2 font-dashboard-medium text-dashboard-foreground">
      {children}
    </h3>
  );
}

export function ContactEditorPage() {
  const { t } = useLang();

  const [hasRecord, setHasRecord] = useState<boolean | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<FormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const confirmPendingRef = useRef(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const loadContactUs = () => {
    setIsLoading(true);
    setLoadError(null);
    getContactUs()
      .then((record) => {
        const next = record ? formFromRecord(record) : EMPTY_FORM;
        setForm(next);
        setSavedForm(next);
        setHasRecord(Boolean(record));
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof ApiError
            ? error.message
            : t('تعذر الاتصال بالخادم. حاول مرة أخرى.', 'Could not reach the server. Please try again.'),
        );
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadContactUs();
  }, []);

  const update = <K extends keyof FormState>(key: K) => (value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleCancel = () => setForm(savedForm);

  const handleConfirm = () => {
    if (confirmPendingRef.current) return;
    confirmPendingRef.current = true;
    setIsPending(true);
    const input = formToInput(form);
    const request = hasRecord ? updateContactUs(input) : createContactUs(input);
    request
      .then((record) => {
        const next = formFromRecord(record);
        setForm(next);
        setSavedForm(next);
        setHasRecord(true);
        confirmPendingRef.current = false;
        setIsPending(false);
        setConfirmOpen(false);
        setLastSavedAt(new Date());
        toast.success(
          t('تم حفظ معلومات التواصل بنجاح', 'Contact information saved successfully'),
        );
      })
      .catch((error: unknown) => {
        confirmPendingRef.current = false;
        setIsPending(false);
        toast.error(
          error instanceof ApiError
            ? error.message
            : t('تعذر حفظ التغييرات. حاول مرة أخرى.', 'Could not save the changes. Please try again.'),
        );
      });
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <Container width="comfortable">
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-dashboard-3 py-dashboard-24 text-dashboard-muted-foreground"
          >
            <Loader2 className="size-6 animate-spin text-dashboard-primary" aria-hidden="true" />
            <span className="text-dashboard-table-body">
              {t('جاري تحميل معلومات التواصل...', 'Loading contact information...')}
            </span>
          </div>
        </Container>
      </DashboardShell>
    );
  }

  if (loadError) {
    return (
      <DashboardShell>
        <Container width="comfortable">
          <div
            role="alert"
            className="flex flex-col items-center justify-center gap-dashboard-4 border border-dashboard-border bg-dashboard-surface-raised py-dashboard-16 text-center"
          >
            <TriangleAlert className="size-6 text-dashboard-error-icon" aria-hidden="true" />
            <p className="text-dashboard-table-body text-dashboard-foreground-secondary">{loadError}</p>
            <Button type="button" variant="outline" size="dashboard" onClick={loadContactUs}>
              <RefreshCw className="size-4" aria-hidden="true" />
              {t('إعادة المحاولة', 'Retry')}
            </Button>
          </div>
        </Container>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Container width="comfortable">
        <div className="flex flex-col gap-dashboard-8 py-dashboard-2">
          <PageHeader
            title={t('معلومات التواصل', 'Contact Information')}
          />

          <div className="grid items-start gap-dashboard-8 lg:grid-cols-[300px_1fr]">
            {/* ASIDE (300px per spec §6.6) */}
            <aside className="flex flex-col gap-dashboard-4 border border-dashboard-border bg-dashboard-surface-raised p-dashboard-6 lg:sticky lg:top-dashboard-6">
              <h2 className="text-dashboard-h2 font-dashboard-medium text-dashboard-foreground">
                {t('ملاحظة', 'Note')}
              </h2>
              <p className="text-dashboard-table-body text-dashboard-muted-foreground">
                {t(
                  'هذه هي المعلومات المستخدمة حالياً في صفحة التواصل — أي تعديل هنا يحاكي المحتوى الذي سيظهر للزوار بعد الحفظ.',
                  'This is the information currently used on the Contact page — any edit here previews the content that will show visitors once saved.',
                )}
              </p>

              {lastSavedAt && (
                <div
                  aria-live="polite"
                  className="flex items-center gap-dashboard-2 border-t border-dashboard-border pt-dashboard-4"
                >
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-dashboard-full bg-dashboard-primary"
                  />
                  <span
                    dir="ltr"
                    className="tabular-latin text-dashboard-table-body text-dashboard-foreground-secondary"
                  >
                    {t(
                      `آخر تحديث: اليوم، ${formatClock(lastSavedAt)}`,
                      `Last updated: today, ${formatClock(lastSavedAt)}`,
                    )}
                  </span>
                </div>
              )}
            </aside>

            {/* FORM CARD (1076px per spec §6.6) */}
            <div className="flex flex-col gap-dashboard-8 border border-dashboard-border bg-dashboard-surface p-dashboard-6 lg:p-dashboard-8">
              <div className="flex flex-col gap-dashboard-4">
                <SectionHeading>{t('قنوات التواصل المباشر', 'Direct contact')}</SectionHeading>
                <div className="grid gap-dashboard-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField
                    id="contact-phone"
                    label={t('رقم الهاتف', 'Phone number')}
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={update('phone')}
                  />
                  <TextField
                    id="contact-whatsapp"
                    label={t('واتساب', 'WhatsApp')}
                    type="tel"
                    dir="ltr"
                    value={form.whatsapp}
                    onChange={update('whatsapp')}
                  />
                  <TextField
                    id="contact-email"
                    label={t('البريد الإلكتروني', 'Email')}
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={update('email')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-dashboard-4 border-t border-dashboard-border pt-dashboard-6">
                <SectionHeading>{t('الموقع على الخريطة', 'Location')}</SectionHeading>
                <TextField
                  id="contact-maps"
                  label={t('رابط الموقع على خرائط جوجل', 'Google Maps link')}
                  type="url"
                  dir="ltr"
                  value={form.mapsHref}
                  onChange={update('mapsHref')}
                />
              </div>

              <div className="flex flex-col gap-dashboard-4 border-t border-dashboard-border pt-dashboard-6">
                <SectionHeading>{t('العنوان', 'Address')}</SectionHeading>
                <div className="grid gap-dashboard-4 sm:grid-cols-2">
                  <TextareaField
                    id="contact-address-en"
                    label={t('العنوان (إنجليزي)', 'Address (English)')}
                    dir="ltr"
                    lang="en"
                    value={form.addressEn}
                    onChange={update('addressEn')}
                  />
                  <TextareaField
                    id="contact-address-ar"
                    label={t('العنوان (عربي)', 'Address (Arabic)')}
                    dir="rtl"
                    lang="ar"
                    value={form.addressAr}
                    onChange={update('addressAr')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-dashboard-4 border-t border-dashboard-border pt-dashboard-6">
                <SectionHeading>{t('ساعات العمل', 'Working hours')}</SectionHeading>
                {/* The backend schema (Souroh Dashboard API.yaml) has no
                    separate Friday-status field — describe the full week
                    (including Friday) in the working-days value itself.
                    `work_days_ar` was added alongside `email`, giving working
                    days a real bilingual pair like address already had;
                    unlike `work_days` it's nullable, so an empty value is
                    sent as `null`, not an empty string (see formToInput). */}
                <div className="grid gap-dashboard-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex flex-col gap-dashboard-2">
                    <TextField
                      id="contact-working-days"
                      label={t('أيام العمل (إنجليزي، مع حالة الجمعة)', 'Working days (English, include Friday’s status)')}
                      dir="ltr"
                      value={form.workingDays}
                      onChange={update('workingDays')}
                    />
                    <p className="text-dashboard-table-subtitle text-dashboard-placeholder-foreground">
                      {t('مثال: Sat–Thu, closed Friday', 'e.g. "Sat–Thu, closed Friday"')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-dashboard-2">
                    <TextField
                      id="contact-working-days-ar"
                      label={t('أيام العمل (عربي، مع حالة الجمعة)', 'Working days (Arabic, include Friday’s status)')}
                      dir="rtl"
                      value={form.workingDaysAr}
                      onChange={update('workingDaysAr')}
                    />
                    <p className="text-dashboard-table-subtitle text-dashboard-placeholder-foreground">
                      {t('مثال: السبت - الخميس، الجمعة عطلة', 'e.g. "السبت - الخميس، الجمعة عطلة"')}
                    </p>
                  </div>
                  <TextField
                    id="contact-working-hours"
                    label={t('ساعات العمل', 'Working hours')}
                    dir="ltr"
                    value={form.workingHours}
                    onChange={update('workingHours')}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-dashboard-4 border-t border-dashboard-border pt-dashboard-6">
                <SectionHeading>{t('التواصل الاجتماعي', 'Social media')}</SectionHeading>
                <div className="grid gap-dashboard-4 sm:grid-cols-2 lg:grid-cols-3">
                  <TextField
                    id="contact-instagram"
                    label="Instagram"
                    dir="ltr"
                    value={form.instagram}
                    onChange={update('instagram')}
                  />
                  <TextField
                    id="contact-facebook"
                    label="Facebook"
                    dir="ltr"
                    value={form.facebook}
                    onChange={update('facebook')}
                  />
                  <TextField
                    id="contact-tiktok"
                    label="TikTok"
                    dir="ltr"
                    value={form.tiktok}
                    onChange={update('tiktok')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-dashboard-3 border-t border-dashboard-border pt-dashboard-6">
                <Button type="button" variant="outline" size="dashboard" onClick={handleCancel}>
                  {t('إلغاء', 'Cancel')}
                </Button>
                <Button type="button" size="dashboard" onClick={() => setConfirmOpen(true)}>
                  <Save className="size-4" aria-hidden="true" />
                  {t('حفظ التغييرات', 'Save Changes')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <ConfirmSaveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </DashboardShell>
  );
}
