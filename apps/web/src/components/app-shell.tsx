'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Button, cn } from '@creator/ui';
import { useAppStore } from '@/lib/store';
import type { ExperienceMode } from '@creator/shared';

const NAV = [
  { href: '/app', label: 'Projects' },
  { href: '/app/new', label: 'New Project' },
  { href: '/app/chat', label: 'Chat' },
  { href: '/app/generators', label: 'Generators' },
  { href: '/app/billing', label: 'Billing' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, theme, toggleTheme } = useAppStore();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--border)] bg-[var(--bg-elevated)] md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Creator
          </Link>
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
        <nav className="space-y-1 px-3 pb-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-xl px-3 py-2 text-sm transition',
                pathname === item.href
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] px-5 py-4">
          <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Mode</div>
          <select
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as ExperienceMode)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
