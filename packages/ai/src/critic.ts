import type { ExperienceMode, ReviewReport } from '@creator/shared';
import { ReviewReportSchema } from '@creator/shared';
import { modeSystemPrompt } from '@creator/prompts';
import { ModelRouter } from './router.js';

const EMPTY_REPORT: ReviewReport = {
  overall: 6.5,
  summary: 'Baseline offline review. Connect OpenRouter for model-backed scoring.',
  axes: [
    {
      axis: 'architecture',
      score: 7,
      findings: ['Layering looks intentional.'],
      improvements: ['Document trust boundaries explicitly.'],
    },
    {
      axis: 'security',
      score: 6,
      findings: ['Auth and validation must be verified in generated routes.'],
      improvements: ['Add IDOR tests for every resource ownership path.'],
    },
    {
      axis: 'performance',
      score: 6.5,
      findings: ['No obvious N+1 in the stub.'],
      improvements: ['Add caching strategy for hot read paths.'],
    },
    {
      axis: 'accessibility',
      score: 6,
      findings: ['Ensure forms have labels and focus order.'],
      improvements: ['Run axe on critical flows.'],
    },
    {
      axis: 'testing',
      score: 5.5,
      findings: ['Test plan may be thin in early codegen.'],
      improvements: ['Add contract tests for API and auth.'],
    },
    {
      axis: 'documentation',
      score: 7,
      findings: ['Why-architecture docs are a Creator requirement.'],
      improvements: ['Keep ADRs short and decision-focused.'],
    },
    {
      axis: 'codeQuality',
      score: 7,
      findings: ['Prefer feature modules over grab-bag utils.'],
      improvements: ['Enforce lint + typecheck in CI before merge.'],
    },
  ],
};

export async function runCriticReview(input: {
  router: ModelRouter;
  mode: ExperienceMode;
  files: Array<{ path: string; content: string }>;
  architecture?: unknown;
}): Promise<ReviewReport> {
  const fileDigest = input.files
    .slice(0, 40)
    .map((f) => `### ${f.path}\n${f.content.slice(0, 1200)}`)
    .join('\n\n');

  const result = await input.router.complete(
    [
      {
        role: 'system',
        content: `${modeSystemPrompt(input.mode)}
You are the Critic agent. Score architecture, security, performance, accessibility, testing, documentation, codeQuality from 0-10.
Return ONLY a fenced json block matching ReviewReport.`,
      },
      {
        role: 'user',
        content: `Architecture context:
${JSON.stringify(input.architecture ?? {}, null, 2)}

Files:
${fileDigest || '(no files yet)'}`,
      },
    ],
    'critic',
    input.mode,
  );

  const fenced = result.content.match(/```json\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try {
      return ReviewReportSchema.parse(JSON.parse(fenced[1]));
    } catch {
      // fall through
    }
  }

  if (result.model.endsWith(':offline')) return EMPTY_REPORT;

  return {
    ...EMPTY_REPORT,
    summary: result.content.slice(0, 500),
  };
}
