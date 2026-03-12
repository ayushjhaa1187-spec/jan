import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import {
  BatchSummary,
  BulkMarksInput,
  BulkUpdateInput,
  CreateMarksInput,
  UpdateMarksInput,
  UploadRow,
} from './marks.types';

const ensureExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }
  return exam;
};

const ensureSubjectClassAssignment = async (subjectId: string, classId: string) => {
  const assignment = await prisma.teacherSubject.findFirst({ where: { subjectId, classId } });
  if (!assignment) {
    throw new AppError('This subject is not assigned to this class.', 400);
  }
};

const ensureStudentInClass = async (studentId: string, classId: string) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.classId !== classId) {
    throw new AppError("Student does not belong to the exam's class.", 400);
  }

  return student;
};

const ensureExamStatusForEntry = (status: string): void => {
  if (status !== 'APPROVED') {
    throw new AppError('Marks can only be entered for APPROVED exams.', 400);
  }
};

const ensureExamNotPublished = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Marks for published exams cannot be modified.', 400);
  }
};

const ensureMarksWithinMax = (marks: number, maxMarks: number): void => {
  if (marks > maxMarks) {
    throw new AppError('Marks cannot exceed maximum marks.', 400);
  }
};

const canManageMarks = (permissions: string[]): boolean => permissions.includes('manage_marks');

const verifyTeacherAccess = async (userId: string, examId: string, subjectId: string): Promise<void> => {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  if (!teacher) {
    throw new AppError('Teacher profile not found', 403);
  }

  const exam = await ensureExam(examId);

  const assignment = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher.id,
      subjectId,
      classId: exam.classId,
    },
  });

  if (!assignment) {
    throw new AppError(
      'Access denied. You are not assigned to teach this subject in this class.',
      403,
    );
  }
};

const checkWriteAccess = async (
  userId: string,
  permissions: string[],
  examId: string,
  subjectId: string,
): Promise<void> => {
  if (!canManageMarks(permissions)) {
    await verifyTeacherAccess(userId, examId, subjectId);
  }
};

const upsertMarks = async (
  input: CreateMarksInput,
  enteredById: string,
) => {
  return prisma.marks.upsert({
    where: {
      studentId_subjectId_examId: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        examId: input.examId,
      },
    },
    update: {
      marks: input.marks,
      maxMarks: input.maxMarks ?? 100,
      updatedById: enteredById,
    },
    create: {
      studentId: input.studentId,
      examId: input.examId,
      subjectId: input.subjectId,
      marks: input.marks,
      maxMarks: input.maxMarks ?? 100,
      enteredById,
    },
    include: {
      student: true,
      subject: true,
      exam: true,
      enteredBy: { select: { id: true, email: true } },
    },
  });
};

export const marksService = {
  async createMarks(input: CreateMarksInput, userId: string, permissions: string[]) {
    const exam = await ensureExam(input.examId);
    ensureExamStatusForEntry(exam.status);

    ensureMarksWithinMax(input.marks, input.maxMarks ?? 100);
    await ensureSubjectClassAssignment(input.subjectId, exam.classId);
    await ensureStudentInClass(input.studentId, exam.classId);
    await checkWriteAccess(userId, permissions, input.examId, input.subjectId);

    return upsertMarks(input, userId);
  },

  async updateMarks(id: string, input: UpdateMarksInput, userId: string, permissions: string[]) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureExamNotPublished(exam.status);
    ensureMarksWithinMax(input.marks, existing.maxMarks);
    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId);

    return prisma.marks.update({
      where: { id },
      data: {
        marks: input.marks,
          updatedById: userId,
      },
      include: {
        student: true,
        subject: true,
        exam: true,
      },
    });
  },

  async deleteMarks(id: string, userId: string, permissions: string[]) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureExamNotPublished(exam.status);
    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId);

    await prisma.marks.delete({ where: { id } });
  },

  async getMarksById(id: string) {
    const marks = await prisma.marks.findUnique({
      where: { id },
      include: {
        student: true,
        subject: true,
        exam: true,
        enteredBy: { select: { id: true, email: true } },
      },
    });

    if (!marks) {
      throw new AppError('Marks record not found', 404);
    }

    return marks;
  },

  async getMarksByExam(examId: string) {
    await ensureExam(examId);

    return prisma.marks.findMany({
      where: { examId },
      include: {
        student: true,
        subject: true,
        enteredBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getMarksByExamSubject(examId: string, subjectId: string) {
    const exam = await ensureExam(examId);
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const entries = await prisma.marks.findMany({
      where: { examId, subjectId },
      include: {
        student: true,
        enteredBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });
    const marksValues = entries.map((item) => item.marks);

    return {
      exam: { id: exam.id, name: exam.name },
      subject: { id: subject.id, name: subject.name, code: subject.code },
      entries: entries.map((entry) => ({
        id: entry.id,
        student: {
          id: entry.student.id,
          adm_no: entry.student.enrollmentNo,
          name: `${entry.student.firstName} ${entry.student.lastName}`,
        },
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        remarks: null,
        enteredBy: entry.enteredBy.email,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      summary: {
        totalStudents: students.length,
        marksEntered: entries.length,
        average: marksValues.length > 0 ? Number((marksValues.reduce((a, b) => a + b, 0) / marksValues.length).toFixed(1)) : 0,
        highest: marksValues.length > 0 ? Math.max(...marksValues) : 0,
        lowest: marksValues.length > 0 ? Math.min(...marksValues) : 0,
      },
    };
  },

  async getMarksByStudent(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return prisma.marks.findMany({
      where: { studentId },
      include: {
        exam: true,
        subject: true,
        enteredBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async bulkCreateMarks(input: BulkMarksInput, userId: string, permissions: string[]): Promise<BatchSummary> {
    const exam = await ensureExam(input.examId);
    ensureExamStatusForEntry(exam.status);
    await ensureSubjectClassAssignment(input.subjectId, exam.classId);
    await checkWriteAccess(userId, permissions, input.examId, input.subjectId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const entry of input.entries) {
      try {
        ensureMarksWithinMax(entry.marks, entry.maxMarks ?? 100);
        await ensureStudentInClass(entry.studentId, exam.classId);

        await upsertMarks(
          {
            studentId: entry.studentId,
            examId: input.examId,
            subjectId: input.subjectId,
            marks: entry.marks,
            maxMarks: entry.maxMarks,
          },
          userId,
        );

        summary.successful += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          studentId: entry.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return summary;
  },

  async bulkUpdateMarks(input: BulkUpdateInput, userId: string, permissions: string[]): Promise<BatchSummary> {
    const first = await prisma.marks.findUnique({ where: { id: input.updates[0].id } });
    if (!first) {
      throw new AppError('First marks record not found', 404);
    }

    await checkWriteAccess(userId, permissions, first.examId, first.subjectId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const item of input.updates) {
      try {
        const existing = await prisma.marks.findUnique({ where: { id: item.id } });
        if (!existing) {
          throw new AppError('Marks record not found', 404);
        }

        if (existing.examId !== first.examId || existing.subjectId !== first.subjectId) {
          throw new AppError('All updates must belong to the same exam and subject.', 400);
        }

        const exam = await ensureExam(existing.examId);
        ensureExamNotPublished(exam.status);
        ensureMarksWithinMax(item.marks, existing.maxMarks);

        await prisma.marks.update({
          where: { id: item.id },
          data: {
            marks: item.marks,
            updatedById: userId,
          },
        });

        summary.successful += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          studentId: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return summary;
  },

  async uploadMarksRows(
    examId: string,
    subjectId: string,
    rows: UploadRow[],
    userId: string,
    permissions: string[],
  ): Promise<BatchSummary> {
    const exam = await ensureExam(examId);
    ensureExamStatusForEntry(exam.status);
    await ensureSubjectClassAssignment(subjectId, exam.classId);
    await checkWriteAccess(userId, permissions, examId, subjectId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const row of rows) {
      try {
        const student = await prisma.student.findUnique({ where: { enrollmentNo: row.adm_no } });
        if (!student) {
          throw new AppError('Student admission number not found', 404);
        }

        await ensureStudentInClass(student.id, exam.classId);
        ensureMarksWithinMax(row.marks, 100);

        await upsertMarks(
          {
            studentId: student.id,
            examId,
            subjectId,
            marks: row.marks,
            maxMarks: 100,
            remarks: row.remarks,
          },
          userId,
        );

        summary.successful += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          studentId: row.adm_no,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return summary;
  },

  async generateTemplate(examId: string, subjectId: string): Promise<{ filename: string; buffer: Buffer }> {
    const exam = await ensureExam(examId);
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    const header = 'adm_no,student_name,marks,remarks\n';
    const rows = students
      .map((student) => `${student.enrollmentNo},${student.firstName} ${student.lastName},,`)
      .join('\n');

    const csv = `${header}${rows}`;
    const safeExamName = exam.name.replace(/\s+/g, '_');
    const safeSubjectName = subject.name.replace(/\s+/g, '_');

    return {
      filename: `marks_template_${safeExamName}_${safeSubjectName}.xlsx`,
      buffer: Buffer.from(csv, 'utf-8'),
    };
  },
};
