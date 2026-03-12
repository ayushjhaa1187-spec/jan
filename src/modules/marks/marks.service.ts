import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
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

const ensureSubjectClassAssignment = async (subjectId: string, classId: string): Promise<void> => {
  const assignment = await prisma.teacherSubject.findFirst({ where: { subjectId, classId } });
  if (!assignment) {
    throw new AppError('This subject is not assigned to this class.', 400);
  }
};

const ensureStudentInClass = async (studentId: string, classId: string): Promise<void> => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  if (student.classId !== classId) {
    throw new AppError("Student does not belong to the exam's class.", 400);
  }
};

const ensureMarksValid = (marks: number, maxMarks: number): void => {
  if (marks > maxMarks) {
    throw new AppError('Marks cannot exceed maximum marks.', 400);
  }
};

const ensureExamForEntry = (status: string): void => {
  if (status !== 'APPROVED') {
    throw new AppError('Marks can only be entered for APPROVED exams.', 400);
  }
};

const ensureExamNotPublished = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Marks for published exams cannot be modified.', 400);
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
    where: { teacherId: teacher.id, subjectId, classId: exam.classId },
  });

  if (!assignment) {
    throw new AppError('Access denied. You are not assigned to teach this subject in this class.', 403);
  }
};

const assertWriteAccess = async (
  userId: string,
  permissions: string[],
  examId: string,
  subjectId: string,
): Promise<void> => {
  if (!canManageMarks(permissions)) {
    await verifyTeacherAccess(userId, examId, subjectId);
  }
};

const upsertMarks = async (input: CreateMarksInput, userId: string) =>
  prisma.marks.upsert({
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
      updatedById: userId,
    },
    create: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      examId: input.examId,
      marks: input.marks,
      maxMarks: input.maxMarks ?? 100,
      enteredById: userId,
    },
    include: {
      student: true,
      subject: true,
      exam: true,
      enteredBy: { select: { id: true, email: true } },
    },
  });

export const marksService = {
  verifyTeacherAccess,

  async createMarks(data: CreateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const exam = await ensureExam(data.examId);
    ensureExamForEntry(exam.status);
    await assertWriteAccess(userId, permissions, data.examId, data.subjectId);
    await ensureSubjectClassAssignment(data.subjectId, exam.classId);
    await ensureStudentInClass(data.studentId, exam.classId);
    ensureMarksValid(data.marks, data.maxMarks ?? 100);

    const saved = await upsertMarks(data, userId);

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: saved.id,
      details: { examId: data.examId, subjectId: data.subjectId, studentId: data.studentId },
      ipAddress,
    });

    return saved;
  },

  async updateMarks(id: string, data: UpdateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureExamNotPublished(exam.status);
    await assertWriteAccess(userId, permissions, existing.examId, existing.subjectId);
    ensureMarksValid(data.marks, existing.maxMarks);

    const updated = await prisma.marks.update({
      where: { id },
      data: { marks: data.marks, updatedById: userId },
      include: { student: true, subject: true, exam: true },
    });

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: updated.id,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
      ipAddress,
    });

    return updated;
  },

  async deleteMarks(id: string, userId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureExamNotPublished(exam.status);
    await assertWriteAccess(userId, permissions, existing.examId, existing.subjectId);

    await prisma.marks.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_MARKS',
      entity: 'Marks',
      entityId: id,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
      ipAddress,
    });
  },

  async getMarks(id: string) {
    const marks = await prisma.marks.findUnique({
      where: { id },
      include: { student: true, subject: true, exam: true, enteredBy: { select: { id: true, email: true } } },
    });

    if (!marks) {
      throw new AppError('Marks record not found', 404);
    }

    return marks;
  },

  async getExamMarks(examId: string) {
    await ensureExam(examId);
    return prisma.marks.findMany({
      where: { examId },
      include: { student: true, subject: true, enteredBy: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getExamSubjectMarks(examId: string, subjectId: string) {
    const exam = await ensureExam(examId);
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const entries = await prisma.marks.findMany({
      where: { examId, subjectId },
      include: { student: true, enteredBy: { select: { id: true, email: true } } },
      orderBy: [{ student: { firstName: 'asc' } }, { student: { lastName: 'asc' } }],
    });

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });
    const values = entries.map((entry) => entry.marks);

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
        enteredBy: entry.enteredBy.email,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      summary: {
        totalStudents: students.length,
        marksEntered: entries.length,
        average: values.length > 0 ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)) : 0,
        highest: values.length > 0 ? Math.max(...values) : 0,
        lowest: values.length > 0 ? Math.min(...values) : 0,
      },
    };
  },

  async getStudentMarks(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return prisma.marks.findMany({
      where: { studentId },
      include: { exam: true, subject: true, enteredBy: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async bulkCreateMarks(data: BulkMarksInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const exam = await ensureExam(data.examId);
    ensureExamForEntry(exam.status);
    await assertWriteAccess(userId, permissions, data.examId, data.subjectId);
    await ensureSubjectClassAssignment(data.subjectId, exam.classId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const item of data.entries) {
      try {
        ensureMarksValid(item.marks, item.maxMarks ?? 100);
        await ensureStudentInClass(item.studentId, exam.classId);
        await upsertMarks(
          {
            studentId: item.studentId,
            examId: data.examId,
            subjectId: data.subjectId,
            marks: item.marks,
            maxMarks: item.maxMarks,
            remarks: item.remarks,
          },
          userId,
        );
        summary.successful += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          studentId: item.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    void logAudit({
      userId,
      action: 'BULK_MARKS_UPLOAD',
      entity: 'Marks',
      details: { examId: data.examId, subjectId: data.subjectId, successful: summary.successful, failed: summary.failed },
      ipAddress,
    });

    return summary;
  },

  async bulkUpdateMarks(data: BulkUpdateInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const first = await prisma.marks.findUnique({ where: { id: data.updates[0]?.id } });
    if (!first) {
      throw new AppError('First marks record not found', 404);
    }

    await assertWriteAccess(userId, permissions, first.examId, first.subjectId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const item of data.updates) {
      try {
        const existing = await prisma.marks.findUnique({ where: { id: item.id } });
        if (!existing) {
          throw new AppError('Marks record not found', 404);
        }

        const exam = await ensureExam(existing.examId);
        ensureExamNotPublished(exam.status);
        ensureMarksValid(item.marks, existing.maxMarks);

        await prisma.marks.update({
          where: { id: item.id },
          data: { marks: item.marks, updatedById: userId },
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

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      details: { batch: true, successful: summary.successful, failed: summary.failed },
      ipAddress,
    });

    return summary;
  },

  async uploadMarks(
    examId: string,
    subjectId: string,
    rows: UploadRow[],
    userId: string,
    permissions: string[],
    ipAddress?: string,
  ): Promise<BatchSummary> {
    const entries = await Promise.all(
      rows.map(async (row) => {
        const student = await prisma.student.findUnique({ where: { enrollmentNo: row.adm_no } });
        if (!student) {
          throw new AppError(`Student not found for adm_no: ${row.adm_no}`, 404);
        }

        return {
          studentId: student.id,
          marks: row.marks,
          remarks: row.remarks,
        };
      }),
    );

    return this.bulkCreateMarks({ examId, subjectId, entries }, userId, permissions, ipAddress);
  },

  async downloadTemplate(examId: string, subjectId: string) {
    const exam = await ensureExam(examId);
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return students.map((student) => ({ adm_no: student.enrollmentNo, name: `${student.firstName} ${student.lastName}` }));
  },
};
