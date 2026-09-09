import { useEffect, useId, useRef, useState } from "react";
import { Loader2, RefreshCw, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Container } from "../../components/Container";
import { PageHeader } from "../../components/PageHeader";
import { ConfirmSaveDialog } from "../../components/ConfirmSaveDialog";
import { IMAGE_ACCEPT, ImageDropzone } from "../../components/ImageDropzone";
import { DashboardShell } from "../../layouts/DashboardShell";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useLang } from "../../../providers/LanguageProvider";
import {
  getGeneralInformation,
  createGeneralInformation,
  updateGeneralInformation,
} from "../../services/generalInformation";
import { ApiError, type GeneralInformation, type GeneralInformationInput } from "../../types";

/**
 * Homepage content editor (figma-spec.md §6.5) — a full page (not a modal),
 * two columns: a form card + a live preview panel that renders the edited
 * headline/copy exactly as it will look on the public Hero. Save opens the
 * shared ConfirmSaveDialog (§1.5/§5) rather than committing immediately —
 * that two-step flow is real, designed behavior specific to this screen and
 * the Contact editor, unlike Services/Projects/News which save directly.
 *
 * Wired to the real singleton `/api/general-information/` endpoint
 * (`dashboard/services/generalInformation.ts`) — CLAUDE.md's Dashboard API
 * section log. This screen is fully independent of the public `Hero.tsx`;
 * it neither reads nor writes that file. `getGeneralInformation()` returns
 * `null` on a 404 (no record created yet), in which case the form falls
 * back to today's literal default copy as a reasonable first-run starting
 * point, and Save uses `createGeneralInformation` (POST, multipart,
 * `hero_img` required) instead of `updateGeneralInformation` (PATCH,
 * multipart, `hero_img` omitted unless the admin picked a new file this
 * session) — tracked via `hasRecord` below.
 */
type Bilingual = { ar: string; en: string };

/** Only used as a first-run starting point when no record exists yet
 *  (`getGeneralInformation()` returned `null`) — never used to override
 *  real server data. */
const FALLBACK_HEADLINE_PRIMARY: Bilingual = {
  ar: "نحن لا نعتبرها مجرد وسيلة نقل.",
  en: "We do not treat it as a vehicle.",
};
const FALLBACK_HEADLINE_SECONDARY: Bilingual = {
  ar: "بل نعتبرها قيمة.",
  en: "We treat it as value.",
};
const FALLBACK_SUPPORTING_COPY: Bilingual = {
  ar: "فحص، صيانة، حماية واستعادة للمركبات الفارهة، ضمن تجربة دقيقة وموثّقة تحافظ على قيمة مركبتك.",
  en: "Inspection, maintenance, protection, and restoration for luxury vehicles, delivered through a precise and documented experience that protects your vehicle's value.",
};

type FormState = {
  headlinePrimary: Bilingual;
  headlineSecondary: Bilingual;
  supportingCopy: Bilingual;
};

const FALLBACK_FORM: FormState = {
  headlinePrimary: { ...FALLBACK_HEADLINE_PRIMARY },
  headlineSecondary: { ...FALLBACK_HEADLINE_SECONDARY },
  supportingCopy: { ...FALLBACK_SUPPORTING_COPY },
};

const INPUT_CLASS =
  "h-[var(--dashboard-control-height-input)] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30";
const TEXTAREA_CLASS =
  "min-h-[120px] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30";

/** Maps the real API record onto this screen's bilingual form shape. */
function formFromRecord(record: GeneralInformation): FormState {
  return {
    headlinePrimary: { en: record.main_title, ar: record.main_title_ar },
    headlineSecondary: { en: record.second_title, ar: record.second_title_ar },
    supportingCopy: { en: record.description, ar: record.description_ar },
  };
}

/**
 * One legend + an EN/AR input pair — Main headline and Second headline share
 * this exact shape, only the presence of the bronze swatch differs.
 */
function BilingualInputGroup({
  legend,
  value,
  onChange,
  swatch,
}: {
  legend: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
  swatch?: boolean;
}) {
  const { t } = useLang();
  const idBase = useId();

  return (
    <div className="flex flex-col gap-dashboard-3">
      <div className="flex flex-wrap items-center gap-dashboard-3">
        <h3 className="text-dashboard-h2 font-dashboard-medium text-dashboard-foreground">
          {legend}
        </h3>
        {swatch && (
          <span
            className="inline-flex items-center gap-dashboard-2"
            title={t(
              "يظهر هذا السطر دائماً باللون البرونزي المعتمد للموقع — مؤشر ثابت، وليس أداة اختيار لون.",
              "This line always renders in the site's fixed bronze accent color — a fixed indicator, not a color picker.",
            )}
          >
            <span
              aria-hidden="true"
              className="block size-[18px] shrink-0 border border-white/25"
              style={{ background: "var(--sorouh-bronze)" }}
            />
            <span className="text-dashboard-table-subtitle uppercase text-dashboard-faint-foreground">
              {t("لون ثابت", "Fixed color")}
            </span>
          </span>
        )}
      </div>

      <div className="grid gap-dashboard-4 sm:grid-cols-2">
        <div className="flex flex-col gap-dashboard-2">
          <label
            htmlFor={`${idBase}-en`}
            dir="ltr"
            lang="en"
            className="text-dashboard-label-en text-dashboard-foreground-secondary"
          >
            English
          </label>
          <Input
            id={`${idBase}-en`}
            dir="ltr"
            lang="en"
            value={value.en}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-dashboard-2">
          <label
            htmlFor={`${idBase}-ar`}
            dir="rtl"
            lang="ar"
            className="text-dashboard-label-ar text-dashboard-foreground-secondary"
          >
            العربية
          </label>
          <Input
            id={`${idBase}-ar`}
            dir="rtl"
            lang="ar"
            value={value.ar}
            onChange={(event) => onChange({ ...value, ar: event.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

function BilingualTextareaGroup({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
}) {
  const idBase = useId();

  return (
    <div className="flex flex-col gap-dashboard-3">
      <h3 className="text-dashboard-h2 font-dashboard-medium text-dashboard-foreground">
        {legend}
      </h3>
      <div className="grid gap-dashboard-4 sm:grid-cols-2">
        <div className="flex flex-col gap-dashboard-2">
          <label
            htmlFor={`${idBase}-en`}
            dir="ltr"
            lang="en"
            className="text-dashboard-label-en text-dashboard-foreground-secondary"
          >
            English
          </label>
          <Textarea
            id={`${idBase}-en`}
            dir="ltr"
            lang="en"
            rows={5}
            value={value.en}
            onChange={(event) => onChange({ ...value, en: event.target.value })}
            className={TEXTAREA_CLASS}
          />
        </div>
        <div className="flex flex-col gap-dashboard-2">
          <label
            htmlFor={`${idBase}-ar`}
            dir="rtl"
            lang="ar"
            className="text-dashboard-label-ar text-dashboard-foreground-secondary"
          >
            العربية
          </label>
          <Textarea
            id={`${idBase}-ar`}
            dir="rtl"
            lang="ar"
            rows={5}
            value={value.ar}
            onChange={(event) => onChange({ ...value, ar: event.target.value })}
            className={TEXTAREA_CLASS}
          />
        </div>
      </div>
    </div>
  );
}

export function HomepageEditorPage() {
  const { t } = useLang();

  const [hasRecord, setHasRecord] = useState<boolean | null>(null);
  const [form, setForm] = useState<FormState>(FALLBACK_FORM);
  const [savedForm, setSavedForm] = useState<FormState>(FALLBACK_FORM);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [dropzoneResetKey, setDropzoneResetKey] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const confirmPendingRef = useRef(false);

  const loadGeneralInformation = () => {
    setIsLoading(true);
    setLoadError(null);
    getGeneralInformation()
      .then((record) => {
        const next = record ? formFromRecord(record) : FALLBACK_FORM;
        setForm(next);
        setSavedForm(next);
        setSavedImageUrl(record ? record.hero_img : null);
        setBackgroundPreviewUrl(record ? record.hero_img : null);
        setPendingImageFile(null);
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
    loadGeneralInformation();
  }, []);

  const handleImageChange = (file: File | null) => {
    setPendingImageFile(file);
    setBackgroundPreviewUrl(file ? URL.createObjectURL(file) : savedImageUrl);
  };

  const handleCancel = () => {
    setForm(savedForm);
    setBackgroundPreviewUrl(savedImageUrl);
    setPendingImageFile(null);
    setDropzoneResetKey((key) => key + 1);
  };

  const handleConfirm = () => {
    if (confirmPendingRef.current) return;

    if (!hasRecord && !pendingImageFile) {
      toast.error(
        t(
          'يرجى اختيار صورة الخلفية قبل الحفظ لأول مرة.',
          'Please choose a background image before saving for the first time.',
        ),
      );
      return;
    }

    confirmPendingRef.current = true;
    setIsPending(true);

    const baseInput: GeneralInformationInput = {
      main_title: form.headlinePrimary.en,
      main_title_ar: form.headlinePrimary.ar,
      second_title: form.headlineSecondary.en,
      second_title_ar: form.headlineSecondary.ar,
      description: form.supportingCopy.en,
      description_ar: form.supportingCopy.ar,
      ...(pendingImageFile ? { hero_img: pendingImageFile } : {}),
    };

    const request = hasRecord
      ? updateGeneralInformation(baseInput)
      : createGeneralInformation(baseInput as Required<GeneralInformationInput>);

    request
      .then((record) => {
        const next = formFromRecord(record);
        setForm(next);
        setSavedForm(next);
        setSavedImageUrl(record.hero_img);
        setBackgroundPreviewUrl(record.hero_img);
        setPendingImageFile(null);
        setHasRecord(true);
        confirmPendingRef.current = false;
        setIsPending(false);
        setConfirmOpen(false);
        toast.success(
          t("تم حفظ محتوى الرئيسية بنجاح", "Homepage content saved successfully"),
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
              {t('جاري تحميل محتوى الرئيسية...', 'Loading homepage content...')}
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
            <Button type="button" variant="outline" size="dashboard" onClick={loadGeneralInformation}>
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
          <PageHeader title={t(" الرئيسية", "Homepage Content")} />

          <div className="grid items-start gap-dashboard-8 lg:grid-cols-[1fr_1.05fr]">
            {/* FORM CARD (~653px per spec §6.5) */}
            <div className="flex flex-col gap-dashboard-8 border border-dashboard-border bg-dashboard-surface p-dashboard-6 lg:p-dashboard-8">
              <BilingualInputGroup
                legend={t("العنوان الرئيسي", "Main headline")}
                value={form.headlinePrimary}
                onChange={(next) =>
                  setForm((f) => ({ ...f, headlinePrimary: next }))
                }
              />

              <BilingualInputGroup
                legend={t("العنوان الثاني", "Second headline")}
                value={form.headlineSecondary}
                onChange={(next) =>
                  setForm((f) => ({ ...f, headlineSecondary: next }))
                }
                swatch
              />

              <BilingualTextareaGroup
                legend={t("النص المساند", "Supporting copy")}
                value={form.supportingCopy}
                onChange={(next) =>
                  setForm((f) => ({ ...f, supportingCopy: next }))
                }
              />

              <div className="flex flex-col gap-dashboard-3">
                <h3 className="text-dashboard-h2 font-dashboard-medium text-dashboard-foreground">
                  {t("صورة الخلفية", "Background image")}
                </h3>
                <ImageDropzone
                  key={dropzoneResetKey}
                  label={t("صورة البطل الرئيسية", "Hero background image")}
                  hint={t(
                    "نسبة عرض 16:9 موصى بها",
                    "16:9 aspect ratio recommended",
                  )}
                  aspectRatio="16 / 9"
                  /* hero_img is the one field whose schema also allows gif. */
                  accept={`${IMAGE_ACCEPT},image/gif`}
                  value={backgroundPreviewUrl}
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex items-center justify-end gap-dashboard-3 border-t border-dashboard-border pt-dashboard-6">
                <Button
                  type="button"
                  variant="outline"
                  size="dashboard"
                  onClick={handleCancel}
                >
                  {t("إلغاء", "Cancel")}
                </Button>
                <Button
                  type="button"
                  size="dashboard"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Save className="size-4" aria-hidden="true" />
                  {t("حفظ التغييرات", "Save Changes")}
                </Button>
              </div>
            </div>

            {/* LIVE PREVIEW (~725px per spec §6.5) — mirrors Hero.tsx's own
                typography classes/colors at a scaled-down size, on the same
                #060708 ground, so it's a faithful mini-mockup rather than a
                generic card. */}
            <div className="flex flex-col gap-dashboard-3 lg:sticky lg:top-dashboard-6">
              <span
                dir="ltr"
                lang="en"
                className="text-dashboard-eyebrow-sm uppercase tracking-dashboard-wordmark text-dashboard-faint-foreground"
              >
                {t("معاينة مباشرة", "Live preview")}
              </span>
              <div
                className="relative overflow-hidden border border-dashboard-border"
                style={{ aspectRatio: "4 / 3", background: "#060708" }}
              >
                {backgroundPreviewUrl && (
                  <img
                    src={backgroundPreviewUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full object-cover"
                    style={{ filter: "brightness(0.5) contrast(1.1)" }}
                  />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/55 via-45% to-[#060708]/25" />
                <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-6 lg:p-8">
                  <span
                    className="font-display block text-[var(--sorouh-ivory)]"
                    style={{
                      fontSize: "clamp(18px,2.6vw,30px)",
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {t(form.headlinePrimary.ar, form.headlinePrimary.en)}
                  </span>
                  <span
                    className="font-display block text-[var(--sorouh-bronze)]"
                    style={{
                      fontSize: "clamp(20px,3vw,34px)",
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {t(form.headlineSecondary.ar, form.headlineSecondary.en)}
                  </span>
                  <p
                    className="max-w-[420px] text-[var(--sorouh-steel)]"
                    style={{ fontSize: 13, lineHeight: 1.75 }}
                  >
                    {t(form.supportingCopy.ar, form.supportingCopy.en)}
                  </p>
                </div>
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
