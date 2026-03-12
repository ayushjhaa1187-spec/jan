import { z } from 'zod';

export const createExamSchema = z
  .object({
    name: z.string().min(2).max(100),
    classId: z.string().uuid(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const updateExamSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }

    return true;
  }, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  });

export const rejectExamSchema = z.object({
  reason: z.string().min(5),
});
