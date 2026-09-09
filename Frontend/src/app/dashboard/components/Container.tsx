import * as React from 'react';

import { cn } from '../../components/ui/utils';

/**
 * Page container — the "page container / content width" layer of the
 * Container System (dashboard-theme.css §7). Figma's own frames only ever
 * specify a fixed 1280–1400px desktop column (figma-spec.md §3.1/§4.3);
 * below that, since no Dashboard mobile/tablet frame exists in the file,
 * this falls back to the project's existing Tailwind default breakpoints
 * with a systematic (not Figma-sourced) inset, exactly as documented in
 * dashboard-theme.css's own breakpoint section.
 */
type ContainerProps = React.ComponentProps<'div'> & {
  /** 1280px (figma-spec.md §4.3's lower bound) or 1400px (upper bound). */
  width?: 'content' | 'comfortable';
};

export function Container({
  className,
  width = 'content',
  ...props
}: ContainerProps) {
  return (
    <div
      data-slot="dashboard-container"
      className={cn(
        'mx-auto w-full px-dashboard-4 md:px-[var(--dashboard-content-inset-compact)] dashboard-desktop:px-[var(--dashboard-content-inset-comfortable)]',
        width === 'comfortable'
          ? 'max-w-[var(--dashboard-content-width-comfortable)]'
          : 'max-w-[var(--dashboard-content-width)]',
        className,
      )}
      {...props}
    />
  );
}
