'use client';

import Editor from '@monaco-editor/react';

export function CodeEditor({
  path,
  language,
  value,
  onChange,
}: {
  path?: string;
  language: string;
  value: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="h-full min-h-[420px] overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="border-b border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--muted)]">
        {path ?? 'untitled'}
      </div>
      <Editor
        height="100%"
        theme="vs-dark"
        path={path}
        language={normalizeLanguage(language)}
        value={value}
        onChange={(v) => onChange?.(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

function normalizeLanguage(language: string) {
  if (language === 'typescript') return 'typescript';
  if (language === 'javascript') return 'javascript';
  if (language === 'markdown') return 'markdown';
  if (language === 'json') return 'json';
  if (language === 'yaml') return 'yaml';
  return 'plaintext';
}
