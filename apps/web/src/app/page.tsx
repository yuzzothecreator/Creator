'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@creator/ui';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,17,23,0.2),rgba(11,17,23,0.85))]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-16 pt-8">
        <header className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted)]">AI Software Engineering Platform</div>
          <Link href="/app">
            <Button variant="secondary">Open Studio</Button>
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-sm uppercase tracking-[0.28em] text-[var(--accent)]"
          >
            Creator
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="max-w-4xl text-5xl font-semibold tracking-tight text-[var(--text)] md:text-7xl"
          >
            Creator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-4 max-w-2xl text-2xl text-[var(--text)] md:text-3xl"
          >
            Build Software Like a Senior Engineer.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg"
          >
            From idea to production architecture — with explanations, reviews, and mentorship at every step.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/app/new">
              <Button>Start a project</Button>
            </Link>
            <Link href="/app/chat">
              <Button variant="secondary">Ask Creator</Button>
            </Link>
          </motion.div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            ['13-step workflow', 'Approve architecture before a single file is generated.'],
            ['Mentoring modes', 'Beginner, Intermediate, and Senior — same engine, different depth.'],
            ['Production bar', 'Security, performance, docs, and review scores travel with the code.'],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl"
            >
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
