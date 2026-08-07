'use client';

import { cn } from '@creator/ui';

export interface EditorFile {
  id: string;
  path: string;
  language: string;
}

export function FileTree({
  files,
  activePath,
  onSelect,
}: {
  files: EditorFile[];
  activePath?: string;
  onSelect: (path: string) => void;
}) {
  return (
    <div className="h-full overflow-auto p-3 text-sm">
      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Files</div>
      <ul className="space-y-1">
        {files.map((file) => (
          <li key={file.id}>
            <button
              type="button"
              onClick={() => onSelect(file.path)}
              className={cn(
                'w-full rounded-lg px-2 py-1.5 text-left font-mono text-xs transition',
                activePath === file.path
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:bg-white/5 hover:text-[var(--text)]',
              )}
            >
              {file.path}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
