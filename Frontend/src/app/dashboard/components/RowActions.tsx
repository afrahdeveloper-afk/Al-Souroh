import * as React from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { useLang } from '../../providers/LanguageProvider';

/**
 * The edit-pencil + delete-trash icon-button pair every table row repeats
 * across Services/Projects/News/Categories (figma-spec.md §5's "Row-action
 * icon button" entry — one shared pattern, multiple node IDs). Composes
 * the existing Button primitive (size="dashboardIcon", the 30–32px hit
 * target spec §4.3 calls for) rather than being a second, parallel
 * icon-button component.
 */
type RowActionsProps = {
  editTo?: string;
  onEdit?: () => void;
  editLabel?: string;
  entityLabelAr: string;
  entityLabelEn: string;
  itemName?: string;
  /** May return a Promise — RowActions awaits it to know when the delete has
   *  actually settled, so it can keep the confirm dialog open (disabled,
   *  relabeled "Deleting...") for the whole request instead of dismissing
   *  instantly on click. */
  onDelete: () => void | Promise<void>;
  isDeletePending?: boolean;
};

export function RowActions({
  editTo,
  onEdit,
  editLabel,
  entityLabelAr,
  entityLabelEn,
  itemName,
  onDelete,
  isDeletePending,
}: RowActionsProps) {
  const { t } = useLang();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletingRef = useRef(false);
  const editAccessibleLabel = editLabel ?? t('تعديل', 'Edit');
  const deleteAccessibleLabel = t('حذف', 'Delete');

  const handleConfirmDelete = async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      deletingRef.current = false;
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div data-slot="dashboard-row-actions" className="flex items-center gap-dashboard-2">
      {editTo ? (
        <Button asChild variant="ghost" size="dashboardIcon" aria-label={editAccessibleLabel}>
          <Link to={editTo}>
            <Pencil className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="dashboardIcon"
          aria-label={editAccessibleLabel}
          onClick={onEdit}
        >
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      )}

      <Button
        type="button"
        variant="ghost"
        size="dashboardIcon"
        aria-label={deleteAccessibleLabel}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setDeleteOpen(open);
        }}
        entityLabelAr={entityLabelAr}
        entityLabelEn={entityLabelEn}
        itemName={itemName}
        isPending={isDeleting || isDeletePending}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}
