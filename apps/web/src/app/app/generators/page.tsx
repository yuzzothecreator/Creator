'use client';

import { useState } from 'react';
import { Button, Panel } from '@creator/ui';
import { api } from '@/lib/api';

export default function GeneratorsPage() {
  const [output, setOutput] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    try {
      setOutput(await fn());
    } catch (error) {
      setOutput({ error: error instanceof Error ? error.message : 'Failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Generators</h1>
        <p className="mt-2 text-[var(--muted)]">
          UI, database, API, and DevOps generators — plus security/performance scans.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={loading} onClick={() => run(() => api.generateUi('Billing settings panel with invoice table'))}>
          UI generator
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => run(() => api.generateDatabase(['Customer', 'Invoice', 'Payment']))}
        >
          Database designer
        </Button>
        <Button variant="secondary" disabled={loading} onClick={() => run(() => api.generateApi('trpc'))}>
          API generator
        </Button>
        <Button variant="secondary" disabled={loading} onClick={() => run(() => api.generateDevops('creator-app'))}>
          DevOps generator
        </Button>
      </div>
      <Panel className="p-5">
        <pre className="max-h-[560px] overflow-auto text-xs">{JSON.stringify(output, null, 2)}</pre>
      </Panel>
    </div>
  );
}
