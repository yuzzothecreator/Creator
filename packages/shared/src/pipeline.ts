import { z } from 'zod';

export const PipelineStepTypeSchema = z.enum([
  'understand',
  'clarify',
  'prd',
  'user_stories',
  'features',
  'tech_stack',
  'folder_structure',
  'architecture',
  'database',
  'api_design',
  'ui_wireframe',
  'impl_plan',
  'await_approval',
  'codegen',
  'review',
  'docs_pack',
]);
export type PipelineStepType = z.infer<typeof PipelineStepTypeSchema>;

export const PipelineStepStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'awaiting_user',
  'skipped',
]);
export type PipelineStepStatus = z.infer<typeof PipelineStepStatusSchema>;

/** Ordered steps shown to the user (13-step product flow + post-approval). */
export const PIPELINE_STEP_ORDER: PipelineStepType[] = [
  'understand',
  'clarify',
  'prd',
  'user_stories',
  'features',
  'tech_stack',
  'folder_structure',
  'architecture',
  'database',
  'api_design',
  'ui_wireframe',
  'impl_plan',
  'await_approval',
  'codegen',
  'review',
  'docs_pack',
];

export const MentoringPayloadSchema = z.object({
  why: z.string(),
  tradeoffs: z.array(z.string()).default([]),
  security: z.array(z.string()).default([]),
  performance: z.array(z.string()).default([]),
  commonMistakes: z.array(z.string()).default([]),
  seniorTips: z.array(z.string()).default([]),
  nextStep: z.string(),
  beginnerExercises: z.array(z.string()).optional(),
});
export type MentoringPayload = z.infer<typeof MentoringPayloadSchema>;

export const PipelineStepSchema = z.object({
  id: z.string(),
  type: PipelineStepTypeSchema,
  status: PipelineStepStatusSchema,
  payload: z.unknown().optional(),
  mentoring: MentoringPayloadSchema.optional(),
  error: z.string().optional(),
});
export type PipelineStep = z.infer<typeof PipelineStepSchema>;
