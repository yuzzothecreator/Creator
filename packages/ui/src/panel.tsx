import type { ReactNode } from 'react';
import { cn } from './cn';

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl shadow-[var(--shadow)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
