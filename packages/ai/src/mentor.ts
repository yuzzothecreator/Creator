import type { CreatorResponse, ExperienceMode } from '@creator/shared';
import { CreatorResponseSchema } from '@creator/shared';

export function parseCreatorResponse(raw: string, mode: ExperienceMode): CreatorResponse {
  const fenced = raw.match(/```json\s*([\s\S]*?)```/);
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1]);
      return CreatorResponseSchema.parse({ ...parsed, mode });
    } catch {
      // fall through
    }
  }

  return CreatorResponseSchema.parse({
    explanation: raw,
    why: 'Structured mentoring fields were inferred from free-form model output.',
    bestPractices: [],
    commonMistakes: [],
    seniorTips: mode === 'senior' ? ['Prefer measurable SLOs over vague quality claims.'] : [],
    securityNotes: [],
    performanceNotes: [],
    nextStep: 'Review the artifact panel and continue the generation pipeline.',
    mode,
    exercises:
      mode === 'beginner'
        ? ['Restate the problem in one sentence.', 'List three users of this system.']
        : undefined,
  });
}

export function densifyForMode(response: CreatorResponse, mode: ExperienceMode): CreatorResponse {
  if (mode === 'senior') {
    return {
      ...response,
      mode,
      explanation: trimTo(response.explanation, 800),
      exercises: undefined,
    };
  }
  if (mode === 'beginner') {
    return {
      ...response,
      mode,
      exercises: response.exercises?.length
        ? response.exercises
        : ['Draw the data flow on paper.', 'Name one security risk and how you would mitigate it.'],
    };
  }
  return { ...response, mode };
}

function trimTo(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
