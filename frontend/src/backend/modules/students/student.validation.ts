import { z } from 'zod';

export const createStudentSchema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  classId: z.string().uuid(),
});

export const updateStudentSchema = createStudentSchema.partial();

export const transferClassSchema = z.object({
  classId: z.string().uuid(),
});
