import * as React from 'react';
import { Loader2, Save, ShieldCheck } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useLang } from '../../providers/LanguageProvider';

/**
 * Shared "تأكيد حفظ التغييرات؟" second-step confirmation used by the
 * Homepage content editor and Contact info editor (figma-spec.md §6.5/§6.6
 * — the same component in both flows per §5's component inventory). Unlike
 * DeleteConfirmDialog this one is always the same copy, so it's controlled
 * (no trigger prop) — the caller's own "Save Changes" button opens it.
 */
type ConfirmSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  /**
   * 0-1 upload progress, for callers that send files big enough that a
   * bare spinner reads as a hang (Site Images sends up to fourteen images
   * in one request). Omitted by the text-only editors, which have nothing
   * to measure.
   */
  progress?: number | null;
};

export function ConfirmSaveDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  progress,
}: ConfirmSaveDialogProps) {
  const { t } = useLang();
  const percent =
    isPending && typeof progress === 'number'
      ? Math.round(Math.max(0, Math.min(1, progress)) * 100)
      : null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-dialog-kind="confirm"
        className="max-w-[420px] gap-dashboard-6"
      >
        <AlertDialogHeader>
          <div className="mb-dashboard-2 flex size-12 items-center justify-center self-center border border-dashboard-primary/40 text-dashboard-primary">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle>
            {t('تأكيد حفظ التغييرات؟', 'Confirm saving changes?')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'سيتم تحديث المحتوى الظاهر على الموقع عند اكتمال الحفظ.',
              'The content shown on the live site will update once saving completes.',
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {percent !== null && (
          <div className="flex flex-col gap-dashboard-2">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={t('تقدّم الرفع', 'Upload progress')}
              className="h-[3px] w-full bg-dashboard-border"
            >
              <div
                className="h-full bg-dashboard-primary transition-[width] duration-200"
                style={{ width: `${percent}%` }}
              />
            </div>
            {/* Number and unit as separate runs so the bidi algorithm can't
                reorder a Latin percentage inside the Arabic sentence. */}
            <p className="flex items-center gap-dashboard-2 text-dashboard-table-subtitle text-dashboard-muted-foreground">
              <span dir="ltr" className="tabular-latin">
                {percent}%
              </span>
              <span>
                {percent < 100
                  ? t('جارٍ رفع الصور', 'Uploading images')
                  : t('اكتمل الرفع — بانتظار الخادم', 'Upload complete — waiting for the server')}
              </span>
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
          {/* AlertDialogAction is Radix's Dialog.Close under the hood, which
              closes the dialog on click by default — before the save request
              even starts, and regardless of whether it later fails. Each
              caller's onConfirm already only clears its own `open` state on
              success (leaving the dialog open + isPending reset on error, so
              the admin can retry) — event.preventDefault() here is what lets
              that intended control actually take effect instead of being
              silently overridden by Radix's own auto-close. */}
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            aria-busy={isPending || undefined}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t('جارٍ الحفظ...', 'Saving...')}
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                {t('تأكيد', 'Confirm')}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
