import { z } from 'zod';

export const ReviewAxisSchema = z.enum([
  'architecture',
  'security',
  'performance',
  'accessibility',
  'testing',
  'documentation',
  'codeQuality',
]);
export type ReviewAxis = z.infer<typeof ReviewAxisSchema>;

export const AxisScoreSchema = z.object({
  axis: ReviewAxisSchema,
  score: z.number().min(0).max(10),
  findings: z.array(z.string()),
  improvements: z.array(z.string()),
});
export type AxisScore = z.infer<typeof AxisScoreSchema>;

export const ReviewReportSchema = z.object({
  overall: z.number().min(0).max(10),
  axes: z.array(AxisScoreSchema),
  summary: z.string(),
});
export type ReviewReport = z.infer<typeof ReviewReportSchema>;
