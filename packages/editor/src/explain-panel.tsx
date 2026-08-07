'use client';

import { Panel } from '@creator/ui';

export function ExplainPanel({
  explanation,
}: {
  explanation: {
    path: string;
    explanation: string;
    why: string;
    securityNotes?: string[];
    performanceNotes?: string[];
    nextStep?: string;
  } | null;
}) {
  if (!explanation) {
    return (
      <Panel className="p-4 text-sm text-[var(--muted)]">
        Select a file to explain every decision like a mentor.
      </Panel>
    );
  }

  return (
    <Panel className="space-y-3 p-4 text-sm">
      <div>
        <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Explain</div>
        <h3 className="mt-1 font-mono text-[var(--accent)]">{explanation.path}</h3>
      </div>
      <p>{explanation.explanation}</p>
      <div>
        <strong>Why</strong>
        <p className="text-[var(--muted)]">{explanation.why}</p>
      </div>
      {explanation.securityNotes?.length ? (
        <div>
          <strong>Security</strong>
          <ul className="mt-1 list-disc pl-5 text-[var(--muted)]">
            {explanation.securityNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {explanation.performanceNotes?.length ? (
        <div>
          <strong>Performance</strong>
          <ul className="mt-1 list-disc pl-5 text-[var(--muted)]">
            {explanation.performanceNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {explanation.nextStep ? (
        <div className="rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2">
          <strong>Next step:</strong> {explanation.nextStep}
        </div>
      ) : null}
    </Panel>
  );
}
