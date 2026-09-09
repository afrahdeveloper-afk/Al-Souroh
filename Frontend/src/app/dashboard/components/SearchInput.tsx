import * as React from 'react';
import { Search } from 'lucide-react';

import { Input } from '../../components/ui/input';
import { cn } from '../../components/ui/utils';

/**
 * The "البحث في..." search field figma-spec.md §9 asks be built as one
 * shared, parameterized component (Services/Projects/News toolbars all use
 * the identical bordered-input-plus-icon shape, only the placeholder
 * copy differs — including the News list's placeholder bug the spec
 * flags at §1.3, which is exactly why the caller supplies the copy rather
 * than the component guessing/hardcoding it).
 */
type SearchInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  containerClassName?: string;
};

export function SearchInput({
  className,
  containerClassName,
  'aria-label': ariaLabel,
  placeholder,
  ...props
}: SearchInputProps) {
  return (
    <div
      data-slot="dashboard-search-input"
      className={cn('relative w-full', containerClassName)}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-dashboard-placeholder-foreground"
      />
      <Input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn('ps-9 pe-3', className)}
        {...props}
      />
    </div>
  );
}
