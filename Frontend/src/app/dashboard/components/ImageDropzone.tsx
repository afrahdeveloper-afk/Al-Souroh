import * as React from 'react';
import { useId, useRef, useState } from 'react';
import { ImageOff, Loader2, Upload, X } from 'lucide-react';

import { cn } from '../../components/ui/utils';
import { useLang } from '../../providers/LanguageProvider';
import { compressImageFile } from '../lib/imageCompression';

/**
 * Drag-and-drop image uploader — Services (1x), Projects (3x: before/
 * after/cover), Homepage and News (1x each) all need this per
 * figma-spec.md §6, but Figma only ever designed the empty idle dropzone
 * (§7: "only the idle empty dropzone state exists... no selected/preview/
 * progress/error state, across all four upload contexts"). The idle look
 * (dashed bronze-alpha border, upload icon, helper copy) is Figma-sourced;
 * the selected-preview, drag-over, and error states are original —
 * genuinely new UI this codebase has no existing precedent for, built to
 * the same accessibility bar the Nav dropdown / Projects modal already
 * established (a real <label>+<input type="file"> pair, not a bare
 * click-only <div>, so it's keyboard- and screen-reader-reachable).
 */
/**
 * The formats every image field in "Souroh Dashboard API.yaml" accepts —
 * each one's `pattern` is `(?:jpg|jpeg|png|webp|avif)$`. Narrower than a
 * blanket `image/*`, deliberately: the file picker should not offer a HEIC
 * or TIFF the backend will reject with a 400 after the upload has already
 * been sent. (`general-information`'s hero_img also allows gif and passes
 * its own `accept` for that.)
 */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

type ImageDropzoneProps = {
  label: string;
  hint?: string;
  aspectRatio?: string;
  value?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  /** Defaults to the formats every image endpoint accepts (see IMAGE_ACCEPT). */
  accept?: string;
  className?: string;
};

export function ImageDropzone({
  label,
  hint,
  aspectRatio = '4 / 3',
  value,
  onChange,
  error,
  disabled,
  accept = IMAGE_ACCEPT,
  className,
}: ImageDropzoneProps) {
  const { t } = useLang();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const pickTokenRef = useRef(0);

  /**
   * Every picked file is downscaled/re-encoded here rather than in any one
   * page, so all five upload contexts (Services, Projects x3, News,
   * Homepage, Site Images) get it for free — an untouched camera photo is
   * several megabytes, and the Site Images home-page group sends fourteen
   * of them in one request. See ../lib/imageCompression.ts.
   *
   * `pickToken` guards against a slow compression resolving after the admin
   * has already picked a different file (or cleared the slot): only the
   * newest pick is allowed to commit.
   */
  const commitFile = async (file: File | null) => {
    const token = ++pickTokenRef.current;

    if (!file) {
      setIsProcessing(false);
      setPreviewUrl(null);
      onChange(null);
      return;
    }

    setIsProcessing(true);
    const prepared = await compressImageFile(file);
    if (token !== pickTokenRef.current) return;

    setIsProcessing(false);
    setPreviewUrl(URL.createObjectURL(prepared));
    onChange(prepared);
  };

  return (
    <div data-slot="dashboard-image-dropzone" className={cn('flex flex-col gap-dashboard-2', className)}>
      <label
        htmlFor={inputId}
        className="text-dashboard-label-en font-dashboard-regular text-dashboard-foreground-secondary"
      >
        {label}
        {hint && (
          <span className="ms-dashboard-2 text-dashboard-placeholder-foreground">
            {hint}
          </span>
        )}
      </label>

      <div
        style={{ aspectRatio }}
        data-drag-over={isDragOver || undefined}
        data-has-error={Boolean(error) || undefined}
        className={cn(
          'relative flex w-full flex-col items-center justify-center gap-dashboard-2 overflow-hidden border border-dashed border-dashboard-border-dashed bg-dashboard-surface-sunken text-center transition-colors',
          'data-[drag-over]:border-dashboard-primary-hover data-[drag-over]:bg-dashboard-surface',
          'data-[has-error]:border-dashboard-error',
          (disabled || isProcessing) && 'pointer-events-none opacity-50',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) commitFile(file);
        }}
      >
        {isProcessing ? (
          <>
            <Loader2 className="size-6 animate-spin text-dashboard-primary" aria-hidden="true" />
            <span className="px-dashboard-4 text-dashboard-table-body text-dashboard-muted-foreground">
              {t('جارٍ تجهيز الصورة...', 'Preparing image...')}
            </span>
          </>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={t(`معاينة: ${label}`, `Preview: ${label}`)}
              className="absolute inset-0 size-full object-cover"
            />
            <button
              type="button"
              aria-label={t('إزالة الصورة', 'Remove image')}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                inputRef.current!.value = '';
                commitFile(null);
              }}
              className="absolute end-2 top-2 z-10 flex size-8 items-center justify-center border border-dashboard-border-emphasis bg-dashboard-scrim text-dashboard-foreground hover:text-dashboard-error"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            {error ? (
              <ImageOff className="size-6 text-dashboard-error" aria-hidden="true" />
            ) : (
              <Upload className="size-6 text-dashboard-primary-hover" aria-hidden="true" />
            )}
            <span className="px-dashboard-4 text-dashboard-table-body text-dashboard-muted-foreground">
              {error ?? t('اسحب الصورة هنا أو اضغط للاختيار', 'Drag an image here, or click to browse')}
            </span>
          </>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled || isProcessing}
          onChange={(event) => commitFile(event.target.files?.[0] ?? null)}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
