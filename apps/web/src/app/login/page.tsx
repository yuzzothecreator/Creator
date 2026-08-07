'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Panel } from '@creator/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@creator.dev');
  const [password, setPassword] = useState('creator-demo-1');
  const [message, setMessage] = useState<string | null>(null);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        // Dev fallback messaging — demo user path still works via /auth/me
        setMessage('Auth endpoint unavailable or invalid credentials. Studio still supports demo user mode.');
        return;
      }
      window.location.href = '/app';
    } catch {
      setMessage('Could not reach API. Start the API and use demo mode from /app.');
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-2xl font-semibold">
        Creator
      </Link>
      <Panel className="p-6">
        <h1 className="text-xl font-medium">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Email/password and magic links via Better Auth. OAuth when provider keys are set.
        </p>
        <form className="mt-6 space-y-4" onSubmit={signIn}>
          <label className="block space-y-2 text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </label>
          {message ? <p className="text-sm text-[var(--warning)]">{message}</p> : null}
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
        <Link href="/app" className="mt-4 inline-block text-sm text-[var(--accent)]">
          Continue with demo user →
        </Link>
      </Panel>
    </main>
  );
}
