import { z } from 'zod';
import { ExperienceModeSchema } from './modes.js';
import { CreatorResponseSchema } from './creator-response.js';

export const ChatRoleSchema = z.enum(['user', 'assistant', 'system']);
export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const SendMessageSchema = z.object({
  sessionId: z.string().optional(),
  projectId: z.string().optional(),
  content: z.string().min(1).max(20000),
  mode: ExperienceModeSchema.optional(),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: ChatRoleSchema,
  content: z.string(),
  mentoring: CreatorResponseSchema.optional(),
  createdAt: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
