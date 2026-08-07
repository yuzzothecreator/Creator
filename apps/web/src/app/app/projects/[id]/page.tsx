'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Badge, Button, Panel } from '@creator/ui';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function ProjectPipelinePage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const qc = useQueryClient();
  const [answers, setAnswers] = useState('');

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
  });
  const pipelineQuery = useQuery({
    queryKey: ['pipeline', projectId],
    queryFn: () => api.getPipeline(projectId),
  });

  const advance = useMutation({
    mutationFn: () => api.advancePipeline(projectId, answers || undefined),
    onSuccess: async () => {
      setAnswers('');
      await qc.invalidateQueries({ queryKey: ['pipeline', projectId] });
      await qc.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const approve = useMutation({
    mutationFn: () => api.approvePipeline(projectId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['pipeline', projectId] });
      await qc.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const project = projectQuery.data;
  const run = pipelineQuery.data;
  const active = run?.steps.find((s) => s.type === run.stage);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{project?.name ?? 'Project'}</h1>
            <p className="mt-2 max-w-2xl text-[var(--muted)]">{project?.idea}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/projects/${projectId}/studio`}>
              <Button variant="secondary">Open Studio</Button>
            </Link>
            <a href={api.exportUrl(projectId)}>
              <Button variant="ghost">Export ZIP</Button>
            </a>
          </div>
        </div>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Generation pipeline</h2>
            <Badge>stage: {run?.stage ?? '…'}</Badge>
          </div>
          <ol className="space-y-2">
            {(run?.steps ?? []).map((step, index) => (
              <motion.li
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs">{step.type}</span>
                <Badge>{step.status}</Badge>
              </motion.li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => advance.mutate()} disabled={advance.isPending || run?.stage === 'await_approval'}>
              {advance.isPending ? 'Advancing…' : 'Advance step'}
            </Button>
            {run?.stage === 'await_approval' ? (
              <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
                {approve.isPending ? 'Approving…' : 'Approve & generate code'}
              </Button>
            ) : null}
          </div>
          {run?.stage === 'clarify' ? (
            <textarea
              className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm"
              rows={4}
              placeholder="Answer clarifying questions…"
              value={answers}
              onChange={(e) => setAnswers(e.target.value)}
            />
          ) : null}
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel className="p-5">
          <h2 className="text-lg font-medium">Artifact inspector</h2>
          <pre className="mt-3 max-h-[360px] overflow-auto rounded-xl border border-[var(--border)] bg-black/20 p-3 text-xs">
            {JSON.stringify(active?.payload ?? { message: 'Advance the pipeline to produce artifacts.' }, null, 2)}
          </pre>
        </Panel>
        {active?.mentoring ? (
          <Panel className="space-y-3 p-5 text-sm">
            <h2 className="text-lg font-medium">Mentoring</h2>
            <p>
              <strong>Why:</strong> {active.mentoring.why}
            </p>
            <Notes title="Security" items={active.mentoring.security} />
            <Notes title="Performance" items={active.mentoring.performance} />
            <Notes title="Common mistakes" items={active.mentoring.commonMistakes} />
            <Notes title="Senior tips" items={active.mentoring.seniorTips} />
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2">
              Next step: {active.mentoring.nextStep}
            </div>
          </Panel>
        ) : null}
        {(run?.reviewReports?.length ?? 0) > 0 ? (
          <Panel className="p-5">
            <h2 className="text-lg font-medium">Review scorecard</h2>
            <p className="mt-2 text-3xl font-semibold text-[var(--accent)]">
              {run?.reviewReports?.[0]?.overall}/10
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{run?.reviewReports?.[0]?.summary}</p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function Notes({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <strong>{title}</strong>
      <ul className="mt-1 list-disc pl-5 text-[var(--muted)]">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
