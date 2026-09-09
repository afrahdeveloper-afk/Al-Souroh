import * as React from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { useLang } from '../../providers/LanguageProvider';

/**
 * Shared delete-confirmation dialog for Services/Projects/News — one
 * parameterized component instead of the three near-duplicate dialogs
 * Figma actually contains, per figma-spec.md §1.3/§9. §1.3 specifically
 * flags that Figma's own copy is un-adapted boilerplate ("Delete this
 * field?" / "Delete the category") left over from wherever the component
 * was first built — this version always names the real entity and item,
 * which is the fix the spec recommends, not a literal implementation of
 * the wrong copy.
 */
type DeleteConfirmDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  entityLabelAr: string;
  entityLabelEn: string;
  itemName?: string;
  onConfirm: () => void;
  isPending?: boolean;
};

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  trigger,
  entityLabelAr,
  entityLabelEn,
  itemName,
  onConfirm,
  isPending,
}: DeleteConfirmDialogProps) {
  const { t } = useLang();
  const suffixAr = itemName ? ` "${itemName}"` : '';
  const suffixEn = itemName ? ` "${itemName}"` : '';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        data-dialog-kind="delete"
        className="max-w-[390px] gap-dashboard-6"
      >
        <AlertDialogHeader>
          <div className="mb-dashboard-2 flex size-12 items-center justify-center self-center border border-dashboard-error/40 text-dashboard-error">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <AlertDialogTitle>
            {t(`حذف ${entityLabelAr}${suffixAr}؟`, `Delete ${entityLabelEn}${suffixEn}?`)}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              'لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.',
              'This action cannot be undone once completed.',
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('إلغاء', 'Cancel')}</AlertDialogCancel>
          {/* AlertDialogAction is Radix's Dialog.Close under the hood, which
              closes the dialog on click by default — before an async delete
              even starts, so the "pending" state below could never actually
              be seen. event.preventDefault() opts out of that auto-close
              (Radix's own documented pattern for async confirm actions); the
              caller (RowActions) now owns closing the dialog only once the
              delete has actually settled. */}
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
                {t('جارٍ الحذف...', 'Deleting...')}
              </>
            ) : (
              t(`حذف ${entityLabelAr}`, `Delete ${entityLabelEn}`)
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
