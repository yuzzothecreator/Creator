'use client';

import { useState } from 'react';
import { Button, Panel } from '@creator/ui';
import { api, type ChatSendResult } from '@/lib/api';
import { CreatorResponseCard } from '@/components/creator-response-card';
import { useAppStore } from '@/lib/store';

interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mentoring?: ChatSendResult['mentoring'];
}

export default function ChatPage() {
  const mode = useAppStore((s) => s.mode);
  const [sessionId, setSessionId] = useState<string>();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);

  async function send() {
    if (!input.trim()) return;
    const content = input.trim();
    setInput('');
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', content }]);
    setLoading(true);
    try {
      const result = await api.sendChat({ content, mode, sessionId });
      setSessionId(result.sessionId);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.mentoring.explanation,
          mentoring: result.mentoring,
        },
      ]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Chat failed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh)] max-w-4xl flex-col p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight">AI Chat</h1>
        <p className="mt-2 text-[var(--muted)]">
          Mentoring responses include why, tradeoffs, security, and next steps.
        </p>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto pb-4">
        {messages.length === 0 ? (
          <Panel className="p-6 text-[var(--muted)]">
            Ask about architecture, security, stack choices, or how to structure a feature.
          </Panel>
        ) : null}
        {messages.map((message) =>
          message.role === 'user' ? (
            <Panel key={message.id} className="ml-12 p-4">
              {message.content}
            </Panel>
          ) : message.mentoring ? (
            <CreatorResponseCard key={message.id} mentoring={message.mentoring} />
          ) : (
            <Panel key={message.id} className="mr-12 p-4 text-[var(--danger)]">
              {message.content}
            </Panel>
          ),
        )}
      </div>
      <div className="flex gap-2 border-t border-[var(--border)] pt-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className="min-h-[72px] flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2"
          placeholder="Ask Creator…"
        />
        <Button onClick={send} disabled={loading}>
          {loading ? 'Thinking…' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
