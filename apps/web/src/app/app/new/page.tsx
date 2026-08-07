'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Panel } from '@creator/ui';
import { api } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function NewProjectPage() {
  const router = useRouter();
  const mode = useAppStore((s) => s.mode);
  const [name, setName] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const project = await api.createProject({ name, idea, mode });
      router.push(`/app/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New project</h1>
        <p className="mt-2 text-[var(--muted)]">
          Creator will not generate code until you approve the implementation plan.
        </p>
      </div>
      <Panel className="p-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm text-[var(--muted)]">Project name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
              placeholder="Acme Billing"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm text-[var(--muted)]">Idea</span>
            <textarea
              required
              minLength={10}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
              placeholder="Describe the product, users, and constraints…"
            />
          </label>
          {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Start planning'}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
