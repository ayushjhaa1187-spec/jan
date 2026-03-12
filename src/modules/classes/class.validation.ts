import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1),
  section: z.string().length(1),
  year: z.number().int().min(2020),
  teacherId: z.string().uuid().optional(),
});

export const updateClassSchema = createClassSchema.partial();
