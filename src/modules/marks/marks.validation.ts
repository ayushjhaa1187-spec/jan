import { z } from 'zod';

export const createMarksSchema = z.object({
  studentId: z.string().uuid(),
  examId: z.string().uuid(),
  subjectId: z.string().uuid(),
  marks: z.number().min(0),
  maxMarks: z.number().min(1).max(100).default(100),
  remarks: z.string().max(200).optional(),
});

export const updateMarksSchema = z.object({
  marks: z.number().min(0),
  remarks: z.string().max(200).optional(),
});

export const bulkMarksSchema = z.object({
  examId: z.string().uuid(),
  subjectId: z.string().uuid(),
  entries: z.array(
    z.object({
      studentId: z.string().uuid(),
      marks: z.number().min(0),
      maxMarks: z.number().min(1).max(100).default(100),
      remarks: z.string().max(200).optional(),
    }),
  ).min(1).max(200),
});

export const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid(),
      marks: z.number().min(0),
      remarks: z.string().max(200).optional(),
    }),
  ).min(1).max(200),
});

export const uploadRowsSchema = z.object({
  rows: z.array(
    z.object({
      adm_no: z.string().min(1),
      marks: z.number().min(0),
      remarks: z.string().max(200).optional(),
    }),
  ).min(1),
});
