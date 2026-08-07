import type { ReactNode } from 'react';
import { cn } from './cn';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--muted)]',
        className,
      )}
    >
      {children}
    </span>
  );
}
