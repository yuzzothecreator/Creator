'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Badge, Button, Panel } from '@creator/ui';
import { api } from '@/lib/api';

export default function ProjectsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-[var(--muted)]">
            Every project follows the approve-before-code mentoring workflow.
          </p>
        </div>
        <Link href="/app/new">
          <Button>New project</Button>
        </Link>
      </div>

      {isLoading ? <Panel className="p-6 text-[var(--muted)]">Loading projects…</Panel> : null}
      {error ? (
        <Panel className="p-6 text-[var(--danger)]">
          API unavailable. Start Postgres/Redis and `pnpm --filter @creator/api dev`.
        </Panel>
      ) : null}

      <div className="grid gap-4">
        {(data ?? []).map((project) => (
          <Panel key={project.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-medium">{project.name}</h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{project.idea}</p>
              </div>
              <Badge>{project.status}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/app/projects/${project.id}`}>
                <Button variant="secondary">Open pipeline</Button>
              </Link>
              <Link href={`/app/projects/${project.id}/studio`}>
                <Button variant="ghost">Studio</Button>
              </Link>
            </div>
          </Panel>
        ))}
        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <Panel className="p-8 text-center text-[var(--muted)]">
            No projects yet. Start with an idea and Creator will guide the architecture.
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
