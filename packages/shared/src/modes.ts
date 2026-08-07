import { z } from 'zod';

export const ExperienceModeSchema = z.enum(['beginner', 'intermediate', 'senior']);
export type ExperienceMode = z.infer<typeof ExperienceModeSchema>;

export const MODE_LABELS: Record<ExperienceMode, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  senior: 'Senior',
};
