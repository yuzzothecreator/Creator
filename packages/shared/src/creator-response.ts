import { z } from 'zod';
import { ExperienceModeSchema } from './modes.js';

export const CreatorResponseSchema = z.object({
  explanation: z.string(),
  why: z.string(),
  diagramMermaid: z.string().optional(),
  code: z.string().optional(),
  bestPractices: z.array(z.string()).default([]),
  commonMistakes: z.array(z.string()).default([]),
  seniorTips: z.array(z.string()).default([]),
  securityNotes: z.array(z.string()).default([]),
  performanceNotes: z.array(z.string()).default([]),
  nextStep: z.string(),
  mode: ExperienceModeSchema,
  exercises: z.array(z.string()).optional(),
});
export type CreatorResponse = z.infer<typeof CreatorResponseSchema>;
