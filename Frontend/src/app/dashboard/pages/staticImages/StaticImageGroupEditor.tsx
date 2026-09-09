import * as React from 'react';
import { CircleAlert, Loader2, RefreshCw, Save, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { cn } from '../../../components/ui/utils';
import { useLang } from '../../../providers/LanguageProvider';
import { ConfirmSaveDialog } from '../../components/ConfirmSaveDialog';
import { ImageDropzone } from '../../components/ImageDropzone';
import {
  createStaticImages,
  getStaticImages,
  missingRequiredFields,
  updateStaticImages,
} from '../../services/staticImages';
import { ApiError, type StaticImageInput, type StaticImageRecord } from '../../types';
import type { StaticImageGroup, StaticImageSlot } from './staticImageGroups';

/**
 * Editor for one static-image group (one `/api/static-images/<group>/`
 * singleton). Mounted one at a time by StaticImagesPage, keyed on the group
 * so switching pages remounts with a fresh fetch and no carried-over state.
 *
 * The two write modes come straight from the schema and are genuinely
 * different, not a nicety: with no record yet the endpoint's POST requires
 * EVERY image of the group (14 of them for the home page), while an
 * existing record takes a PATCH containing only the slots the admin
 * actually replaced. `hasRecord` decides which, exactly as the Homepage and
 * Contact editors already do for their own singletons.
 */

type SlotState = {
  /** The file picked this session, if any — the only thing ever sent. */
  file: File | null;
  /** Object URL for a picked file; falls back to the stored server URL. */
  previewUrl: string | null;
};

type Status = 'loading' | 'ready' | 'error';

/**
 * Django reuses a stored file's URL when the replacement lands on the same
 * name, so a freshly saved image can render from cache and look like the
 * save silently failed. A token that only changes on save is enough to
 * force a re-fetch, without touching the URL we send anywhere else.
 */
function withCacheBust(url: string, token: number): string {
  if (!token) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${token}`;
}

function StatusBadge({ state }: { state: 'staged' | 'saved' | 'empty' }) {
  const { t } = useLang();

  const label =
    state === 'staged'
      ? t('صورة جديدة — لم تُحفظ', 'New image — unsaved')
      : state === 'saved'
        ? t('محفوظة', 'Saved')
        : t('فارغة', 'Empty');

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-dashboard-2 border px-dashboard-2 py-[2px] text-dashboard-table-subtitle uppercase',
        state === 'staged' && 'border-dashboard-primary/50 text-dashboard-primary',
        state === 'saved' && 'border-dashboard-border text-dashboard-faint-foreground',
        state === 'empty' && 'border-dashboard-warning/50 text-dashboard-warning',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'block size-[6px]',
          state === 'staged' && 'bg-dashboard-primary',
          state === 'saved' && 'bg-dashboard-faint-foreground',
          state === 'empty' && 'bg-dashboard-warning',
        )}
      />
      {label}
    </span>
  );
}

/**
 * A single-slot group is capped rather than stretched: left to fill the
 * 1400px content column, one 16:9 banner renders as a ~1200x675 dropzone,
 * which reads as a page-sized drop target rather than one field.
 */
const COLUMN_CLASS: Record<StaticImageGroup['columns'], string> = {
  1: 'sm:grid-cols-1 max-w-2xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function StaticImageGroupEditor({
  group,
  onPendingCountChange,
}: {
  group: StaticImageGroup;
  /** Lets the page warn before a tab switch throws away picked files. */
  onPendingCountChange?: (count: number) => void;
}) {
  const { t, isAr } = useLang();

  const [status, setStatus] = React.useState<Status>('loading');
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [record, setRecord] = React.useState<StaticImageRecord | null>(null);
  const [slots, setSlots] = React.useState<Record<string, SlotState>>({});
  const [dropzoneKey, setDropzoneKey] = React.useState(0);
  const [cacheBust, setCacheBust] = React.useState(0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const savingRef = React.useRef(false);

  const storedUrl = React.useCallback(
    (field: string) => {
      const value = (record as Record<string, unknown> | null)?.[field];
      return typeof value === 'string' && value ? value : null;
    },
    [record],
  );

  const load = React.useCallback(() => {
    let cancelled = false;
    setStatus('loading');
    setLoadError(null);

    getStaticImages(group.key)
      .then((result) => {
        if (cancelled) return;
        setRecord(result);
        setSlots({});
        setDropzoneKey((key) => key + 1);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : t('تعذّر الاتصال بالخادم. حاول مرة أخرى.', 'Could not reach the server. Please try again.'),
        );
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [group.key]);

  React.useEffect(load, [load]);

  const pendingFields = React.useMemo(
    () => group.slots.map((slot) => slot.field).filter((field) => slots[field]?.file),
    [group.slots, slots],
  );

  React.useEffect(() => {
    onPendingCountChange?.(pendingFields.length);
  }, [pendingFields.length, onPendingCountChange]);

  React.useEffect(() => () => onPendingCountChange?.(0), [onPendingCountChange]);

  const handlePick = (field: string) => (file: File | null) => {
    setSlots((current) => ({
      ...current,
      [field]: { file, previewUrl: file ? URL.createObjectURL(file) : null },
    }));
  };

  const handleReset = () => {
    setSlots({});
    setDropzoneKey((key) => key + 1);
  };

  const buildInput = (): StaticImageInput => {
    const input: Record<string, File> = {};
    for (const slot of group.slots) {
      const file = slots[slot.field]?.file;
      if (file) input[slot.field] = file;
    }
    return input as StaticImageInput;
  };

  const handleSave = () => {
    if (savingRef.current) return;

    const input = buildInput();

    if (pendingFields.length === 0) {
      toast.error(t('لم تختر أي صورة جديدة للحفظ.', 'No new image has been chosen to save.'));
      return;
    }

    if (!record) {
      const missing = missingRequiredFields(group.key, input);
      if (missing.length > 0) {
        const names = missing
          .map((field) => {
            const slot = group.slots.find((s) => s.field === field);
            return slot ? (isAr ? slot.labelAr : slot.labelEn) : field;
          })
          .join(t('، ', ', '));
        toast.error(
          t(
            `الحفظ لأول مرة يتطلب رفع كل الصور. الصور الناقصة: ${names}`,
            `A first save requires every image. Still missing: ${names}`,
          ),
        );
        return;
      }
    }

    savingRef.current = true;
    setIsSaving(true);
    setUploadProgress(0);

    const request = record
      ? updateStaticImages(group.key, input, setUploadProgress)
      : createStaticImages(group.key, input, setUploadProgress);

    request
      .then((saved) => {
        setRecord(saved);
        setSlots({});
        setCacheBust(Date.now());
        setDropzoneKey((key) => key + 1);
        setConfirmOpen(false);
        toast.success(
          t(
            `تم حفظ صور «${group.titleAr}» بنجاح`,
            `${group.titleEn} images saved successfully`,
          ),
        );
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : t('تعذّر حفظ الصور. حاول مرة أخرى.', 'Could not save the images. Please try again.'),
        );
      })
      .finally(() => {
        savingRef.current = false;
        setIsSaving(false);
        setUploadProgress(0);
      });
  };

  if (status === 'loading') {
    return (
      <div
        role="status"
        className="flex flex-col items-center justify-center gap-dashboard-3 border border-dashboard-border bg-dashboard-surface py-dashboard-24 text-dashboard-muted-foreground"
      >
        <Loader2 className="size-6 animate-spin text-dashboard-primary" aria-hidden="true" />
        <span className="text-dashboard-table-body">{t('جارٍ تحميل الصور...', 'Loading images...')}</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-dashboard-4 border border-dashboard-border bg-dashboard-surface py-dashboard-16 text-center"
      >
        <TriangleAlert className="size-6 text-dashboard-error-icon" aria-hidden="true" />
        <p className="text-dashboard-table-body text-dashboard-foreground-secondary">{loadError}</p>
        <Button type="button" variant="outline" size="dashboard" onClick={load}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {t('إعادة المحاولة', 'Retry')}
        </Button>
      </div>
    );
  }

  const emptyCount = group.slots.filter(
    (slot) => !storedUrl(slot.field) && !slots[slot.field]?.file,
  ).length;

  return (
    <section className="flex flex-col gap-dashboard-6">
      <header className="flex flex-col gap-dashboard-4 border border-dashboard-border bg-dashboard-surface p-dashboard-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-dashboard-2">
          <h2 className="text-dashboard-h2 font-dashboard-semibold text-dashboard-foreground">
            {t(group.titleAr, group.titleEn)}
          </h2>
          <p className="max-w-[70ch] text-dashboard-table-body text-dashboard-muted-foreground">
            {t(group.descriptionAr, group.descriptionEn)}
          </p>
          {/* The count and its unit are separate flex items, not one mixed
              string: a Latin number inside an Arabic run gets reordered by
              the bidi algorithm (it rendered as "صورة 14" here before), the
              same trap already documented on the Projects page's tag line.
              Flex order decides the sequence; `dir="ltr"` + .tabular-latin
              only has to isolate the digits themselves. */}
          <p className="flex flex-wrap items-center gap-dashboard-2 text-dashboard-table-subtitle text-dashboard-faint-foreground">
            <span dir="ltr" className="tabular-latin">
              {group.slots.length}
            </span>
            <span>{t('صورة', 'images')}</span>
            <span aria-hidden="true">·</span>
            {emptyCount > 0 ? (
              <>
                <span dir="ltr" className="tabular-latin text-dashboard-warning">
                  {emptyCount}
                </span>
                <span className="text-dashboard-warning">{t('بلا صورة', 'not uploaded')}</span>
              </>
            ) : (
              <span>{t('كل الصور مرفوعة', 'All images uploaded')}</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-dashboard-3">
          <Button
            type="button"
            variant="outline"
            size="dashboard"
            disabled={pendingFields.length === 0 || isSaving}
            onClick={handleReset}
          >
            {t('تراجع', 'Discard')}
          </Button>
          <Button
            type="button"
            size="dashboard"
            disabled={pendingFields.length === 0 || isSaving}
            onClick={() => setConfirmOpen(true)}
          >
            <Save className="size-4" aria-hidden="true" />
            {pendingFields.length > 0
              ? t(`حفظ (${pendingFields.length})`, `Save (${pendingFields.length})`)
              : t('حفظ التغييرات', 'Save Changes')}
          </Button>
        </div>
      </header>

      {!record && (
        <p
          role="note"
          className="flex items-start gap-dashboard-3 border border-dashboard-warning/40 bg-dashboard-surface-sunken p-dashboard-4 text-dashboard-table-body text-dashboard-foreground-secondary"
        >
          <CircleAlert className="mt-[2px] size-4 shrink-0 text-dashboard-warning" aria-hidden="true" />
          {/* A one-image group needs its own wording — "the 1 images all
              together" is nonsense, and there is no follow-up rule to
              explain when the group only ever holds one slot. */}
          <span>
            {group.slots.length === 1
              ? t(
                  'لم تُرفع صورة هذه الصفحة بعد. اخترها ثم اضغط حفظ.',
                  'No image has been uploaded for this page yet. Choose one, then save.',
                )
              : t(
                  `لم تُرفع صور هذه الصفحة بعد. الحفظ لأول مرة يتطلّب اختيار الصور الـ${group.slots.length} كلها معاً؛ بعد ذلك يمكنك تعديل أي صورة بمفردها.`,
                  `No images have been uploaded for this page yet. The first save requires all ${group.slots.length} images together; after that you can replace any single one on its own.`,
                )}
          </span>
        </p>
      )}

      <ul className={cn('grid grid-cols-1 gap-dashboard-4', COLUMN_CLASS[group.columns])}>
        {group.slots.map((slot: StaticImageSlot) => {
          const picked = slots[slot.field];
          const saved = storedUrl(slot.field);
          const state = picked?.file ? 'staged' : saved ? 'saved' : 'empty';
          const previewUrl = picked?.previewUrl ?? (saved ? withCacheBust(saved, cacheBust) : null);

          return (
            <li
              key={slot.field}
              className="flex flex-col gap-dashboard-3 border border-dashboard-border bg-dashboard-surface p-dashboard-4"
            >
              {/* The dropzone's own <label> is the slot's visible title —
                  it is a real label/input pair, so duplicating the text in a
                  separate heading above would only read it twice to a screen
                  reader (and mixing a Latin index into the Arabic label
                  inline would risk the bidi reordering already documented on
                  the Projects page). */}
              <ImageDropzone
                key={`${slot.field}-${dropzoneKey}`}
                label={t(slot.labelAr, slot.labelEn)}
                hint={slot.aspectRatio.replace(' / ', ':')}
                aspectRatio={slot.aspectRatio}
                value={previewUrl}
                onChange={handlePick(slot.field)}
                disabled={isSaving}
              />

              <div className="flex flex-wrap items-center justify-between gap-dashboard-2">
                <span className="min-w-0 text-dashboard-table-subtitle text-dashboard-muted-foreground">
                  {t(slot.hintAr, slot.hintEn)}
                </span>
                <StatusBadge state={state} />
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmSaveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleSave}
        isPending={isSaving}
        progress={uploadProgress}
      />
    </section>
  );
}
