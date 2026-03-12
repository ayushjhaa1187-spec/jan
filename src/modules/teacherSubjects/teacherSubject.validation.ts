import { z } from 'zod';

export const createTeacherSubjectSchema = z.object({
  teacherId: z.string().uuid(),
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
});
