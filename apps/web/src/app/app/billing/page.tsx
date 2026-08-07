'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge, Panel } from '@creator/ui';
import { api } from '@/lib/api';

export default function BillingPage() {
  const { data } = useQuery({
    queryKey: ['billing'],
    queryFn: api.billingPlans,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-[var(--muted)]">
          Plans are wired for Phase 3 checkout adapters. Quotas are enforced via usage events.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {(data?.plans ?? []).map((plan) => (
          <Panel key={plan.id} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">{plan.name}</h2>
              <Badge>${plan.priceUsd}/mo</Badge>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              <li>{plan.limits.projects} projects</li>
              <li>{plan.limits.tokensPerMonth.toLocaleString()} tokens / month</li>
            </ul>
          </Panel>
        ))}
      </div>
    </div>
  );
}
