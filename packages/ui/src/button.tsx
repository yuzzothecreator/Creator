'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export function Button({
  className,
  variant = 'primary',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-[var(--accent)] text-[#042f2e] hover:brightness-110 shadow-[0_0_0_1px_rgba(45,212,191,0.3)]',
        variant === 'secondary' &&
          'bg-[var(--surface-strong)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]',
        variant === 'ghost' && 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-white/5',
        variant === 'danger' && 'bg-[var(--danger)] text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
