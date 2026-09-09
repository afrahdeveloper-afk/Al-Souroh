import * as React from 'react';

import { cn } from '../../components/ui/utils';

/**
 * The page-header block shown on every CMS section screen (Services,
 * Projects, News, Homepage, Contact) — one reusable component instead of
 * re-authoring the same header five times per §1.3 of the mapping doc's
 * Phase-3 plan.
 */
type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      data-slot="dashboard-page-header"
      className={cn(
        'flex flex-col gap-dashboard-3 border-b border-dashboard-border pb-dashboard-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-dashboard-2">
        <h1
          className="text-dashboard-h1 font-dashboard-semibold text-dashboard-foreground"
          style={{ fontFamily: 'var(--dashboard-font-h1)' }}
        >
          {title}
        </h1>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-dashboard-3">
          {actions}
        </div>
      )}
    </header>
  );
}
