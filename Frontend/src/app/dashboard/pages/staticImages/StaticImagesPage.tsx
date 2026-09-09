import * as React from 'react';
import { useSearchParams } from 'react-router';
import { Images } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { cn } from '../../../components/ui/utils';
import { useLang } from '../../../providers/LanguageProvider';
import { Container } from '../../components/Container';
import { PageHeader } from '../../components/PageHeader';
import { DashboardShell } from '../../layouts/DashboardShell';
import { StaticImageGroupEditor } from './StaticImageGroupEditor';
import { STATIC_IMAGE_GROUPS, findStaticImageGroup } from './staticImageGroups';

/**
 * Site Images (`/dashboard/static-images`) — the Dashboard's sixth CMS
 * section, covering the six `/api/static-images/` singletons the backend
 * added alongside the existing CRUD domains.
 *
 * These are the photographs that belong to a *page* rather than to any
 * record: the home page's scroll scenes, the About gallery, and each
 * route's own banner. Six endpoints holding between 1 and 14 images each is
 * far too lopsided for one flat list, so the screen is a page picker (a
 * horizontal strip mirroring DashboardShell's own nav language — bronze
 * underline for the active item — rather than a new navigation idiom) above
 * one group's slot grid at a time. Only the selected group is mounted, so
 * exactly one endpoint is fetched per view instead of six on load.
 *
 * The active group lives in the URL (`?page=home-page`) so a specific
 * group is linkable, refresh-safe, and reachable with the browser's Back
 * button — the picker is real navigation, not a transient toggle.
 */
export function StaticImagesPage() {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const requested = searchParams.get('page') ?? '';
  const activeGroup = findStaticImageGroup(requested) ?? STATIC_IMAGE_GROUPS[0];

  const [pendingCount, setPendingCount] = React.useState(0);
  const [pendingSwitchTo, setPendingSwitchTo] = React.useState<string | null>(null);

  const selectGroup = React.useCallback(
    (key: string) => {
      setSearchParams(key === STATIC_IMAGE_GROUPS[0].key ? {} : { page: key }, { replace: false });
    },
    [setSearchParams],
  );

  const handleTabClick = (key: string) => {
    if (key === activeGroup.key) return;
    if (pendingCount > 0) {
      setPendingSwitchTo(key);
      return;
    }
    selectGroup(key);
  };

  return (
    <DashboardShell>
      <Container width="comfortable" className="flex flex-col gap-dashboard-6 py-dashboard-6">
        <PageHeader title={t('صور الموقع', 'Site Images')} />

        <p className="flex max-w-[80ch] items-start gap-dashboard-3 text-dashboard-table-body text-dashboard-muted-foreground">
          <Images className="mt-[3px] size-4 shrink-0 text-dashboard-primary" aria-hidden="true" />
          <span>
            {t(
              'الصور الثابتة التي تخصّ الصفحات نفسها — لا الخدمات أو المشاريع أو الأخبار. اختر الصفحة، ثم استبدل أي صورة واحفظ.',
              'The fixed images that belong to the pages themselves — not to a service, project, or news item. Pick a page, replace any image, and save.',
            )}
          </span>
        </p>

        {/* Page picker. Scrolls horizontally on narrow viewports using the
            same hide-scrollbar rail technique the top nav already uses —
            no Dashboard mobile design exists in Figma for either. */}
        <div
          role="tablist"
          aria-label={t('صفحات الموقع', 'Site pages')}
          className="hide-scrollbar flex items-stretch gap-dashboard-1 overflow-x-auto border-b border-dashboard-border"
        >
          {STATIC_IMAGE_GROUPS.map((group) => {
            const isActive = group.key === activeGroup.key;
            const Icon = group.icon;
            return (
              <button
                key={group.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(group.key)}
                className={cn(
                  'flex shrink-0 items-center gap-dashboard-2 border-b-2 px-dashboard-4 py-dashboard-3 text-dashboard-button-sm transition-colors',
                  isActive
                    ? 'border-dashboard-primary text-dashboard-primary'
                    : 'border-transparent text-dashboard-faint-foreground hover:text-dashboard-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(group.titleAr, group.titleEn)}
                <span
                  dir="ltr"
                  className="tabular-latin text-dashboard-table-subtitle text-dashboard-placeholder-foreground"
                >
                  {group.slots.length}
                </span>
              </button>
            );
          })}
        </div>

        <StaticImageGroupEditor
          key={activeGroup.key}
          group={activeGroup}
          onPendingCountChange={setPendingCount}
        />
      </Container>

      <AlertDialog
        open={pendingSwitchTo !== null}
        onOpenChange={(open) => {
          if (!open) setPendingSwitchTo(null);
        }}
      >
        <AlertDialogContent data-dialog-kind="confirm" className="max-w-[420px] gap-dashboard-6">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('لديك صور غير محفوظة', 'You have unsaved images')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `اخترت ${pendingCount} صورة ولم تحفظها بعد. الانتقال إلى صفحة أخرى سيلغي هذا الاختيار.`,
                `You picked ${pendingCount} image(s) without saving. Moving to another page will discard them.`,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('البقاء هنا', 'Stay here')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingSwitchTo) selectGroup(pendingSwitchTo);
                setPendingSwitchTo(null);
              }}
            >
              {t('تجاهل والانتقال', 'Discard and switch')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
