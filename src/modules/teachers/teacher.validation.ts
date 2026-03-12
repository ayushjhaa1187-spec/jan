import { z } from 'zod';

export const createTeacherSchema = z.object({
  userId: z.string().uuid(),
  employeeId: z.string().min(1),
  qualification: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().min(10).max(15).optional(),
});

export const updateTeacherSchema = z.object({
  qualification: z.string().optional(),
  designation: z.string().optional(),
  phone: z.string().min(10).max(15).optional(),
});

export const assignClassTeacherSchema = z.object({
  classId: z.string().uuid(),
});
