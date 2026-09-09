import * as React from 'react';
import { Link } from 'react-router';
import { ArrowUpLeft } from 'lucide-react';

import { cn } from '../../components/ui/utils';
import { useLang } from '../../providers/LanguageProvider';

/**
 * One tile of Home's 5-tile CMS navigation grid (figma-spec.md §6.1) — a
 * whole-card link to one CMS domain's list/editor screen: a small
 * diagonal "open" arrow + icon badge in the header row, title + English
 * subtitle, a wrapping description, and a footer "Manage this section"
 * link that's identical on all five cards. Reused 5x on the Home hub, so
 * it's a Shared Component rather than markup repeated per tile.
 */
type NavCardProps = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  titleAr: string;
  titleEn: string;
  description: string;
  className?: string;
};

export function NavCard({
  to,
  icon: Icon,
  titleAr,
  titleEn,
  description,
  className,
}: NavCardProps) {
  const { t, isAr } = useLang();

  return (
    <Link
      to={to}
      data-slot="dashboard-nav-card"
      className={cn(
        'group flex flex-col justify-between gap-dashboard-6 border border-dashboard-border bg-dashboard-surface p-dashboard-6 transition-colors hover:border-dashboard-border-strong hover:bg-dashboard-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dashboard-primary',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <ArrowUpLeft
          aria-hidden="true"
          className={cn(
            'size-4 text-dashboard-placeholder-foreground transition-transform group-hover:text-dashboard-primary',
            isAr ? '' : 'rotate-90',
          )}
        />
        <span className="flex size-[var(--dashboard-icon-size-xl)] items-center justify-center border border-dashboard-border bg-dashboard-surface-sunken text-dashboard-primary">
          <Icon className="size-4" />
        </span>
      </div>

      <div className="flex flex-col gap-dashboard-2">
        <div className="flex flex-col gap-dashboard-1">
          <h3 className="text-dashboard-card-title font-dashboard-semibold text-dashboard-foreground">
            {t(titleAr, titleEn)}
          </h3>
          <span dir="ltr" lang="en" className="text-dashboard-table-subtitle uppercase text-dashboard-faint-foreground">
            {titleEn}
          </span>
        </div>
        <p className="text-dashboard-table-body text-dashboard-muted-foreground">
          {description}
        </p>
      </div>

      <span className="text-dashboard-button-sm text-dashboard-primary">
        {t('إدارة القسم ←', 'Manage this section →')}
      </span>
    </Link>
  );
}
