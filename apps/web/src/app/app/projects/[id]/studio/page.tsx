'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CodeEditor, ExplainPanel, FileTree } from '@creator/editor';
import { Button, Panel } from '@creator/ui';
import { api } from '@/lib/api';

export default function StudioPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [activePath, setActivePath] = useState<string | undefined>();

  const filesQuery = useQuery({
    queryKey: ['files', projectId],
    queryFn: () => api.listFiles(projectId),
  });

  const files = filesQuery.data ?? [];
  const active = useMemo(
    () => files.find((f) => f.path === activePath) ?? files[0],
    [files, activePath],
  );

  const explainQuery = useQuery({
    queryKey: ['explain', projectId, active?.path],
    queryFn: () => api.explainFile(projectId, active!.path),
    enabled: Boolean(active?.path),
  });

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Studio</h1>
          <p className="text-xs text-[var(--muted)]">Monaco workspace with mentor explanations</p>
        </div>
        <a href={api.exportUrl(projectId)}>
          <Button variant="secondary">Export ZIP</Button>
        </a>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_320px]">
        <Panel className="rounded-none border-0 border-r border-[var(--border)]">
          {files.length ? (
            <FileTree
              files={files}
              activePath={active?.path}
              onSelect={(path) => setActivePath(path)}
            />
          ) : (
            <div className="p-4 text-sm text-[var(--muted)]">
              No files yet. Approve the implementation plan to start codegen.
            </div>
          )}
        </Panel>
        <div className="min-h-0 p-3">
          {active ? (
            <CodeEditor
              path={active.path}
              language={active.language}
              value={active.content}
            />
          ) : (
            <Panel className="flex h-full items-center justify-center p-6 text-[var(--muted)]">
              Waiting for generated files…
            </Panel>
          )}
        </div>
        <div className="border-l border-[var(--border)] p-3">
          <ExplainPanel explanation={explainQuery.data ?? null} />
        </div>
      </div>
    </div>
  );
}
