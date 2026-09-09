import * as React from 'react';
import { useNavigate } from 'react-router';
import { Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { ImageDropzone } from '../../components/ImageDropzone';
import { useLang } from '../../../providers/LanguageProvider';
import type { Service, ServiceInput } from '../../types';

/**
 * Shared Add/Edit form — originally built against figma-spec.md §6.2's "6
 * bordered sections" with a fixed-category `Select`, plus Equipment/Vehicle
 * Types/Warranty sections the real backend never had (figma-vs-project-
 * mapping.md §1.4's documented data-shape gap). Now rewired to the real
 * `Service`/`ServiceInput` shape in `Souroh Dashboard API.yaml`: the
 * category `Select` is gone (there is no category taxonomy on the backend
 * at all) in favor of a plain bilingual `service_rank`/`service_rank_ar`
 * text pair, and Equipment/Vehicle Types/Warranty are removed outright —
 * see the comment where each used to sit. Per figma-spec.md §1.6 (no
 * distinct Edit design exists — Figma's Edit screen is byte-identical to
 * Add), this component still pre-fills every field from `initialService`
 * itself rather than following the static mock literally.
 *
 * Every bilingual field renders two separate physical inputs, EN then AR,
 * wrapped in a `dir="ltr"` row so the EN-left/AR-right layout stays fixed
 * regardless of the admin's own active dashboard language — only the
 * surrounding chrome (section titles, buttons) follows `t()`.
 */

type TagPair = { ar: string; en: string };

function pairsFromArrays(ar: string[] = [], en: string[] = []): TagPair[] {
  const length = Math.max(ar.length, en.length);
  return Array.from({ length }, (_, i) => ({ ar: ar[i] ?? '', en: en[i] ?? '' }));
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-dashboard-4 border border-dashboard-border bg-dashboard-surface p-dashboard-6">
      <div className="flex flex-col gap-dashboard-1">
        <h2 className="text-dashboard-h2 font-dashboard-semibold text-dashboard-foreground">{title}</h2>
        {description && (
          <p className="text-dashboard-table-body text-dashboard-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** Fixed-order EN(left)/AR(right) two-column row — see file header. */
function BilingualRow({ children }: { children: React.ReactNode }) {
  return (
    <div dir="ltr" className="grid grid-cols-1 gap-dashboard-4 sm:grid-cols-2">
      {children}
    </div>
  );
}

function BilingualField({
  id,
  labelAr,
  labelEn,
  value,
  onChange,
  lang,
  multiline,
}: {
  id: string;
  labelAr: string;
  labelEn: string;
  value: string;
  onChange: (value: string) => void;
  lang: 'ar' | 'en';
  multiline?: boolean;
}) {
  const isAr = lang === 'ar';
  const label = isAr ? labelAr : labelEn;
  const Field = multiline ? Textarea : Input;

  return (
    <div className="flex flex-col gap-dashboard-2" dir={isAr ? 'rtl' : 'ltr'}>
      <Label
        htmlFor={id}
        className={isAr ? 'text-dashboard-label-ar text-dashboard-foreground-secondary' : 'text-dashboard-label-en text-dashboard-foreground-secondary'}
      >
        {label}
        <span dir="ltr" className="text-dashboard-placeholder-foreground">
          {isAr ? '(AR)' : '(EN)'}
        </span>
      </Label>
      <Field
        id={id}
        dir={isAr ? 'rtl' : 'ltr'}
        lang={isAr ? 'ar' : 'en'}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value)}
        rows={multiline ? 4 : undefined}
      />
    </div>
  );
}

/**
 * Text field + "add" affordance (Enter key or a button) → removable chip
 * rows below, per §6.2 item 4/5's tag-input description. Holds one
 * bilingual (AR + EN) pair per row so the two languages stay paired by
 * index instead of drifting out of sync across two independent lists —
 * used 2x per form (cases handled → service_problems[_ar], main procedures
 * → service_procedures[_ar]).
 */
function TagPairListInput({
  labelAr,
  labelEn,
  items,
  onChange,
}: {
  labelAr: string;
  labelEn: string;
  items: TagPair[];
  onChange: (items: TagPair[]) => void;
}) {
  const { t } = useLang();
  const [draftAr, setDraftAr] = React.useState('');
  const [draftEn, setDraftEn] = React.useState('');

  const commit = () => {
    const ar = draftAr.trim();
    const en = draftEn.trim();
    if (!ar && !en) return;
    onChange([...items, { ar, en }]);
    setDraftAr('');
    setDraftEn('');
  };

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  const onDraftKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  };

  return (
    <div className="flex flex-col gap-dashboard-3">
      <Label className="text-dashboard-label-ar text-dashboard-foreground-secondary">{t(labelAr, labelEn)}</Label>

      {items.length > 0 && (
        <ul className="flex flex-col gap-dashboard-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-dashboard-3 border border-dashboard-border bg-dashboard-surface-sunken px-dashboard-3 py-dashboard-2"
            >
              <span dir="rtl" lang="ar" className="min-w-0 flex-1 truncate text-dashboard-table-body text-dashboard-foreground">
                {item.ar || '—'}
              </span>
              <span dir="ltr" lang="en" className="min-w-0 flex-1 truncate text-dashboard-table-subtitle text-dashboard-faint-foreground">
                {item.en || '—'}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={t('حذف هذا العنصر', 'Remove this item')}
                className="shrink-0 text-dashboard-placeholder-foreground transition-colors hover:text-dashboard-error"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div dir="ltr" className="flex flex-col gap-dashboard-2 sm:flex-row">
        <Input
          value={draftEn}
          onChange={(event) => setDraftEn(event.target.value)}
          onKeyDown={onDraftKeyDown}
          placeholder={t('نص بالإنجليزية', 'Text in English')}
          dir="ltr"
          lang="en"
          aria-label={t(`${labelEn} — بالإنجليزية`, `${labelEn} — English`)}
        />
        <Input
          value={draftAr}
          onChange={(event) => setDraftAr(event.target.value)}
          onKeyDown={onDraftKeyDown}
          placeholder={t('نص بالعربية', 'Text in Arabic')}
          dir="rtl"
          lang="ar"
          aria-label={t(`${labelAr} — بالعربية`, `${labelEn} — Arabic`)}
        />
        <Button type="button" variant="outline" size="dashboard" onClick={commit} className="shrink-0">
          <Plus className="size-4" aria-hidden="true" />
          {t('إضافة', 'Add')}
        </Button>
      </div>
    </div>
  );
}

type ServiceFormProps = {
  initialService?: Service;
  /**
   * Owns the actual network call (create vs. update — the two callers need
   * different endpoints/id handling). This component only builds the
   * `ServiceInput` payload and awaits the caller's promise to drive its own
   * submit-button pending state; the caller is responsible for catching
   * `ApiError` and toasting/navigating.
   */
  onSubmit: (input: ServiceInput) => Promise<void>;
};

export function ServiceForm({ initialService, onSubmit }: ServiceFormProps) {
  const { t } = useLang();
  const navigate = useNavigate();

  const [titleAr, setTitleAr] = React.useState(initialService?.service_name_ar ?? '');
  const [titleEn, setTitleEn] = React.useState(initialService?.service_name ?? '');
  const [descAr, setDescAr] = React.useState(initialService?.service_description_ar ?? '');
  const [descEn, setDescEn] = React.useState(initialService?.service_description ?? '');
  const [rankAr, setRankAr] = React.useState(initialService?.service_rank_ar ?? '');
  const [rankEn, setRankEn] = React.useState(initialService?.service_rank ?? '');
  const [priority, setPriority] = React.useState(
    initialService?.service_priority === undefined ? '' : String(initialService.service_priority),
  );
  const [problems, setProblems] = React.useState<TagPair[]>(() =>
    pairsFromArrays(initialService?.service_problems_ar, initialService?.service_problems),
  );
  const [procedures, setProcedures] = React.useState<TagPair[]>(() =>
    pairsFromArrays(initialService?.service_procedures_ar, initialService?.service_procedures),
  );
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(initialService?.img ?? null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submittingRef = React.useRef(false);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : initialService?.img ?? null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;

    if (!initialService && !imageFile) {
      toast.error(t('يرجى اختيار صورة للخدمة', 'Please choose a service image'));
      return;
    }

    const input: ServiceInput = {
      service_name: titleEn,
      service_name_ar: titleAr,
      service_description: descEn,
      service_description_ar: descAr,
      service_rank: rankEn,
      service_rank_ar: rankAr,
      ...(priority.trim() === '' ? {} : { service_priority: Number(priority) }),
      service_problems: problems.map((p) => p.en).filter(Boolean),
      service_problems_ar: problems.map((p) => p.ar).filter(Boolean),
      service_procedures: procedures.map((p) => p.en).filter(Boolean),
      service_procedures_ar: procedures.map((p) => p.ar).filter(Boolean),
      img: imageFile ?? undefined,
    };

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await onSubmit(input);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-dashboard-6">
      <FormSection title={t('المعلومات الأساسية', 'Basic Information')}>
        <BilingualRow>
          <BilingualField id="svc-title-en" labelAr="اسم الخدمة" labelEn="Service Name" value={titleEn} onChange={setTitleEn} lang="en" />
          <BilingualField id="svc-title-ar" labelAr="اسم الخدمة" labelEn="Service Name" value={titleAr} onChange={setTitleAr} lang="ar" />
        </BilingualRow>
      </FormSection>

      <FormSection
        title={t('الوصف المختصر', 'Short Description')}
        description={t('يظهر هذا الوصف في جدول الخدمات.', 'This description appears in the services table.')}
      >
        <BilingualRow>
          <BilingualField id="svc-desc-en" labelAr="الوصف" labelEn="Description" value={descEn} onChange={setDescEn} lang="en" multiline />
          <BilingualField id="svc-desc-ar" labelAr="الوصف" labelEn="Description" value={descAr} onChange={setDescAr} lang="ar" multiline />
        </BilingualRow>
      </FormSection>

      {/*
        Category was a fixed-list Select against a 10-item taxonomy
        (SERVICE_CATEGORIES) that never existed on the real backend —
        Souroh Dashboard API.yaml's Service schema has no category field at
        all. Replaced with a plain bilingual free-text pair bound to
        service_rank/service_rank_ar per the rewiring brief.
      */}
      <FormSection title={t('التصنيف / الترتيب', 'Category / Rank')}>
        <BilingualRow>
          <BilingualField id="svc-rank-en" labelAr="التصنيف / الترتيب" labelEn="Category / Rank" value={rankEn} onChange={setRankEn} lang="en" />
          <BilingualField id="svc-rank-ar" labelAr="التصنيف / الترتيب" labelEn="Category / Rank" value={rankAr} onChange={setRankAr} lang="ar" />
        </BilingualRow>

        {/* service_priority — added to the backend alongside the static-image
            endpoints. Lower numbers come first in the public site's service
            rail (the field's own description in Souroh Dashboard API.yaml). */}
        <div className="flex max-w-xs flex-col gap-dashboard-2">
          <Label htmlFor="svc-priority" className="text-dashboard-label-ar text-dashboard-foreground-secondary">
            {t('ترتيب الظهور', 'Display order')}
          </Label>
          <Input
            id="svc-priority"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            dir="ltr"
            lang="en"
            className="tabular-latin"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            placeholder={t('مثال: 1', 'e.g. 1')}
          />
          <p className="text-dashboard-table-subtitle text-dashboard-muted-foreground">
            {t(
              'الرقم الأصغر يظهر أولاً في قائمة الخدمات على الموقع. اتركه فارغاً لإبقاء الترتيب الحالي.',
              'The lowest number appears first in the service list on the site. Leave it blank to keep the current order.',
            )}
          </p>
        </div>
      </FormSection>

      <FormSection title={t('الحالات التي نعالجها', 'Cases We Handle')}>
        <TagPairListInput labelAr="الحالات التي نعالجها" labelEn="Cases We Handle" items={problems} onChange={setProblems} />
      </FormSection>

      <FormSection
        title={t('الإجراءات الرئيسية', 'Main Procedures')}
        description={t('ترتيب العناصر هنا هو ترتيب تنفيذ العمل الفعلي.', 'The order of items here reflects the actual sequence of the job.')}
      >
        <TagPairListInput labelAr="الإجراءات الرئيسية" labelEn="Main Procedures" items={procedures} onChange={setProcedures} />
      </FormSection>

      {/*
        Equipment, Vehicle Types, and Warranty sections removed — the real
        Service/ServiceInput schema in Souroh Dashboard API.yaml has no
        equipment, vehicle-type, or warranty fields at all (only
        service_name[_ar], service_description[_ar], service_rank[_ar],
        service_problems[_ar], service_procedures[_ar], and img). Dropped
        rather than kept as dead UI with nowhere to save.
      */}

      <FormSection title={t('الصورة', 'Image')}>
        <div className="max-w-sm">
          <ImageDropzone
            label={t('صورة الخدمة', 'Service Image')}
            aspectRatio="4 / 3"
            value={imagePreviewUrl}
            onChange={handleImageChange}
          />
        </div>
      </FormSection>

      <div className="flex items-center gap-dashboard-3 border-t border-dashboard-border pt-dashboard-6">
        <Button type="submit" size="dashboard" disabled={isSubmitting}>
          <Save className="size-4" aria-hidden="true" />
          {isSubmitting ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ الخدمة', 'Save Service')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="dashboard"
          disabled={isSubmitting}
          onClick={() => navigate('/dashboard/services')}
        >
          {t('إلغاء', 'Cancel')}
        </Button>
      </div>
    </form>
  );
}
