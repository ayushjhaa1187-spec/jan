import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  maxMarks: z.number().int().min(1).max(100).default(100),
});

export const updateSubjectSchema = createSubjectSchema.partial();
