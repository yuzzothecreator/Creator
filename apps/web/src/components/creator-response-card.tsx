'use client';

import { Panel } from '@creator/ui';

export function CreatorResponseCard({
  mentoring,
}: {
  mentoring: {
    explanation: string;
    why: string;
    bestPractices?: string[];
    commonMistakes?: string[];
    seniorTips?: string[];
    securityNotes?: string[];
    performanceNotes?: string[];
    nextStep: string;
    diagramMermaid?: string;
    code?: string;
    exercises?: string[];
  };
}) {
  return (
    <Panel className="space-y-4 p-5">
      <section>
        <h3 className="text-sm uppercase tracking-[0.14em] text-[var(--muted)]">Explanation</h3>
        <p className="mt-2 whitespace-pre-wrap">{mentoring.explanation}</p>
      </section>
      <section>
        <h3 className="text-sm font-medium">Why</h3>
        <p className="mt-1 text-[var(--muted)]">{mentoring.why}</p>
      </section>
      {mentoring.diagramMermaid ? (
        <section>
          <h3 className="text-sm font-medium">Diagram</h3>
          <pre className="mt-2 overflow-auto rounded-xl border border-[var(--border)] bg-black/20 p-3 text-xs">
            {mentoring.diagramMermaid}
          </pre>
        </section>
      ) : null}
      {mentoring.code ? (
        <section>
          <h3 className="text-sm font-medium">Code</h3>
          <pre className="mt-2 overflow-auto rounded-xl border border-[var(--border)] bg-black/20 p-3 text-xs">
            {mentoring.code}
          </pre>
        </section>
      ) : null}
      <Notes title="Best practices" items={mentoring.bestPractices} />
      <Notes title="Common mistakes" items={mentoring.commonMistakes} />
      <Notes title="Senior tips" items={mentoring.seniorTips} />
      <Notes title="Security" items={mentoring.securityNotes} />
      <Notes title="Performance" items={mentoring.performanceNotes} />
      <Notes title="Exercises" items={mentoring.exercises} />
      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-2 text-sm">
        <strong>Next step:</strong> {mentoring.nextStep}
      </div>
    </Panel>
  );
}

function Notes({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section>
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
