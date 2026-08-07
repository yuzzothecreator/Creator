import { modeSystemPrompt, pipelineStepPrompt, responseContractPrompt } from '@creator/prompts';
import type { ExperienceMode, PipelineStepType } from '@creator/shared';
import { ModelRouter, type ChatMessage } from './router.js';
import { densifyForMode, parseCreatorResponse } from './mentor.js';

export class CreatorAgents {
  constructor(private readonly router: ModelRouter) {}

  async runPipelineStep(input: {
    step: PipelineStepType;
    idea: string;
    context: unknown;
    mode: ExperienceMode;
  }) {
    const task = this.router.taskForStep(input.step);
    const messages: ChatMessage[] = [
      { role: 'system', content: `${modeSystemPrompt(input.mode)}\n\n${responseContractPrompt()}` },
      {
        role: 'user',
        content: `${pipelineStepPrompt(input.step, input.idea, JSON.stringify(input.context, null, 2))}

Return a JSON object in a fenced json block matching CreatorResponse plus a "payload" field with structured step data.`,
      },
    ];

    const result = await this.router.complete(messages, task, input.mode);
    const mentoring = densifyForMode(parseCreatorResponse(result.content, input.mode), input.mode);
    const payload = extractPayload(result.content) ?? {
      summary: mentoring.explanation,
      raw: result.content,
    };

    return { mentoring, payload, usage: result };
  }

  async chat(input: { content: string; mode: ExperienceMode; history?: ChatMessage[] }) {
    const messages: ChatMessage[] = [
      { role: 'system', content: `${modeSystemPrompt(input.mode)}\n\n${responseContractPrompt()}` },
      ...(input.history ?? []),
      {
        role: 'user',
        content: `${input.content}

Prefer a fenced json CreatorResponse when giving substantial guidance.`,
      },
    ];
    const result = await this.router.complete(messages, 'chat', input.mode);
    return densifyForMode(parseCreatorResponse(result.content, input.mode), input.mode);
  }
}

function extractPayload(raw: string): unknown {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/);
  if (!fenced?.[1]) return undefined;
  try {
    const parsed = JSON.parse(fenced[1]) as { payload?: unknown };
    return parsed.payload ?? parsed;
  } catch {
    return undefined;
  }
}
