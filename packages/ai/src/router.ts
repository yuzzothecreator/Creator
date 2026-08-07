import type { ExperienceMode, PipelineStepType } from '@creator/shared';

export type AiTask =
  | 'chat'
  | 'planner'
  | 'architect'
  | 'coder'
  | 'critic'
  | 'docs'
  | 'ui';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionResult {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
}

export interface ModelRouterOptions {
  apiKey?: string;
  baseUrl?: string;
  plannerModel?: string;
  coderModel?: string;
  criticModel?: string;
  fastModel?: string;
}

export class ModelRouter {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly models: Record<string, string>;

  constructor(options: ModelRouterOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY ?? '';
    this.baseUrl = options.baseUrl ?? process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
    this.models = {
      planner: options.plannerModel ?? process.env.DEFAULT_PLANNER_MODEL ?? 'anthropic/claude-sonnet-4',
      coder: options.coderModel ?? process.env.DEFAULT_CODER_MODEL ?? 'anthropic/claude-sonnet-4',
      critic: options.criticModel ?? process.env.DEFAULT_CRITIC_MODEL ?? 'openai/gpt-4.1',
      fast: options.fastModel ?? process.env.DEFAULT_FAST_MODEL ?? 'openai/gpt-4.1-mini',
    };
  }

  resolveModel(task: AiTask, _mode?: ExperienceMode): string {
    switch (task) {
      case 'planner':
      case 'architect':
        return this.models.planner!;
      case 'coder':
      case 'docs':
        return this.models.coder!;
      case 'critic':
        return this.models.critic!;
      case 'ui':
      case 'chat':
      default:
        return this.models.fast!;
    }
  }

  taskForStep(step: PipelineStepType): AiTask {
    if (step === 'codegen') return 'coder';
    if (step === 'review') return 'critic';
    if (step === 'docs_pack') return 'docs';
    if (step === 'ui_wireframe') return 'ui';
    if (
      step === 'architecture' ||
      step === 'database' ||
      step === 'api_design' ||
      step === 'folder_structure' ||
      step === 'tech_stack'
    ) {
      return 'architect';
    }
    return 'planner';
  }

  async complete(messages: ChatMessage[], task: AiTask = 'chat', mode?: ExperienceMode): Promise<CompletionResult> {
    const model = this.resolveModel(task, mode);

    if (!this.apiKey) {
      return this.offlineFallback(messages, model);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Creator',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: task === 'critic' ? 0.2 : 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    };

    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? model,
      tokensIn: data.usage?.prompt_tokens ?? 0,
      tokensOut: data.usage?.completion_tokens ?? 0,
    };
  }

  async *stream(
    messages: ChatMessage[],
    task: AiTask = 'chat',
    mode?: ExperienceMode,
  ): AsyncGenerator<string, CompletionResult, void> {
    const model = this.resolveModel(task, mode);

    if (!this.apiKey) {
      const fallback = await this.offlineFallback(messages, model);
      yield fallback.content;
      return fallback;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'Creator',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(`OpenRouter stream error ${response.status}: ${text}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const json = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            yield delta;
          }
        } catch {
          // ignore partial JSON
        }
      }
    }

    return { content: full, model, tokensIn: 0, tokensOut: 0 };
  }

  private offlineFallback(messages: ChatMessage[], model: string): CompletionResult {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const content = [
      '## Creator (offline demo mode)',
      '',
      'No OPENROUTER_API_KEY configured. Returning a structured mentoring stub so local development still works.',
      '',
      `**Your request:** ${lastUser.slice(0, 500)}`,
      '',
      '### Why',
      'Creator never blocks local iteration on missing cloud keys; production requires OpenRouter.',
      '',
      '### Next step',
      'Set OPENROUTER_API_KEY in `.env` and restart the API.',
    ].join('\n');

    return { content, model: `${model}:offline`, tokensIn: 0, tokensOut: 0 };
  }
}
