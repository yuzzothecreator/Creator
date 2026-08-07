import { z } from 'zod';
import { ExperienceModeSchema } from './modes.js';

export const ProjectStatusSchema = z.enum([
  'draft',
  'planning',
  'awaiting_approval',
  'generating',
  'reviewing',
  'ready',
  'failed',
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(120),
  idea: z.string().min(10).max(8000),
  mode: ExperienceModeSchema.default('intermediate'),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const FileNodeSchema = z.object({
  id: z.string(),
  path: z.string(),
  content: z.string(),
  language: z.string(),
});
export type FileNode = z.infer<typeof FileNodeSchema>;
