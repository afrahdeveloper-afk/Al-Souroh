import * as React from 'react';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { SearchInput } from './SearchInput';
import { cn } from '../../components/ui/utils';

/**
 * "+ Add" button + search + item count — the toolbar row every List screen
 * (Services/Projects/News) repeats identically per figma-spec.md §6.2–6.4,
 * built as one shared component per §9's explicit recommendation instead
 * of three near-duplicates.
 *
 * `addTo` (a route) vs `onAdd` (a click handler) map to the two real Add
 * patterns figma-spec.md §1.5 documents: Services' Add is its own full
 * page, Projects/News' Add is a modal — the caller picks whichever this
 * particular list needs.
 */
type ListToolbarProps = {
  addLabel: string;
  onAdd?: () => void;
  addTo?: string;
  searchPlaceholder: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  itemCountLabel?: string;
  secondaryAction?: React.ReactNode;
  className?: string;
};

export function ListToolbar({
  addLabel,
  onAdd,
  addTo,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  itemCountLabel,
  secondaryAction,
  className,
}: ListToolbarProps) {
  return (
    <div
      data-slot="dashboard-list-toolbar"
      className={cn(
        'flex flex-col gap-dashboard-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-dashboard-3">
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          containerClassName="max-w-[495px]"
        />
        {itemCountLabel && (
          <span
            dir="ltr"
            className="tabular-latin shrink-0 whitespace-nowrap text-dashboard-table-header text-dashboard-faint-foreground"
          >
            {itemCountLabel}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-dashboard-3">
        {secondaryAction}
        {addTo ? (
          <Button asChild size="dashboard">
            <Link to={addTo}>
              <Plus className="size-4" aria-hidden="true" />
              {addLabel}
            </Link>
          </Button>
        ) : (
          <Button type="button" size="dashboard" onClick={onAdd}>
            <Plus className="size-4" aria-hidden="true" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
