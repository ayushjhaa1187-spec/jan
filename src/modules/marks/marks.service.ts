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

const hasManagePermission = (permissions: string[]): boolean =>
  permissions.includes('manage_marks');

const ensureExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
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

const ensureSubjectInClass = async (subjectId: string, classId: string) => {
  const assignment = await prisma.teacherSubject.findFirst({ where: { subjectId, classId } });
  if (!assignment) {
    throw new AppError('This subject is not assigned to this class.', 400);
  }
};

const ensureMarksWithinMax = (marks: number, maxMarks: number): void => {
  if (marks > maxMarks) {
    throw new AppError('Marks cannot exceed maximum marks.', 400);
  }
};

const ensureNotPublished = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Marks for published exams cannot be modified.', 400);
  }
};

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
    throw new AppError('Access denied. You are not assigned to teach this subject in this class.', 403);
  }
};

const checkAccess = async (
  userId: string,
  permissions: string[],
  examId: string,
  subjectId: string,
): Promise<void> => {
  if (!hasManagePermission(permissions)) {
    await verifyTeacherAccess(userId, examId, subjectId);
  }
};

const mapEntry = (entry: {
  id: string;
  student: { id: string; enrollmentNo: string; firstName: string; lastName: string };
  marks: number;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
}): {
  id: string;
  student: { id: string; adm_no: string; name: string };
  marks: number;
  maxMarks: number;
  createdAt: Date;
  updatedAt: Date;
} => ({
  id: entry.id,
  student: {
    id: entry.student.id,
    adm_no: entry.student.enrollmentNo,
    name: `${entry.student.firstName} ${entry.student.lastName}`,
  },
  marks: entry.marks,
  maxMarks: entry.maxMarks,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

export const marksService = {
  verifyTeacherAccess,

  async createMarks(data: CreateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const exam = await ensureExam(data.examId);

    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400);
    }

    await checkAccess(userId, permissions, data.examId, data.subjectId);
    ensureMarksWithinMax(data.marks, data.maxMarks ?? 100);
    await ensureStudentInClass(data.studentId, exam.classId);
    await ensureSubjectInClass(data.subjectId, exam.classId);

    const saved = await prisma.marks.upsert({
      where: {
        studentId_subjectId_examId: {
          studentId: data.studentId,
          subjectId: data.subjectId,
          examId: data.examId,
        },
      },
      update: {
        marks: data.marks,
        maxMarks: data.maxMarks ?? 100,
        updatedById: userId,
      },
      create: {
        studentId: data.studentId,
        examId: data.examId,
        subjectId: data.subjectId,
        marks: data.marks,
        maxMarks: data.maxMarks ?? 100,
        enteredById: userId,
      },
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    });

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: saved.id,
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, studentId: data.studentId },
    });

    return saved;
  },

  async updateMarks(id: string, data: UpdateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureNotPublished(exam.status);

    await checkAccess(userId, permissions, existing.examId, existing.subjectId);
    ensureMarksWithinMax(data.marks, existing.maxMarks);

    const updated = await prisma.marks.update({
      where: { id },
      data: {
        marks: data.marks,
        updatedById: userId,
      },
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    });

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: updated.id,
      ipAddress,
      details: { examId: updated.examId, subjectId: updated.subjectId, studentId: updated.studentId },
    });

    return updated;
  },

  async deleteMarks(id: string, userId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Marks record not found', 404);
    }

    const exam = await ensureExam(existing.examId);
    ensureNotPublished(exam.status);
    await checkAccess(userId, permissions, existing.examId, existing.subjectId);

    await prisma.marks.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_MARKS',
      entity: 'Marks',
      entityId: id,
      ipAddress,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
    });
  },

  async getMarks(id: string) {
    const marks = await prisma.marks.findUnique({
      where: { id },
      include: {
        student: true,
        subject: true,
        exam: true,
      },
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
      include: {
        student: true,
        subject: true,
      },
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
      include: { student: true },
      orderBy: [{ student: { firstName: 'asc' } }, { student: { lastName: 'asc' } }],
    });

    const classStudents = await prisma.student.findMany({ where: { classId: exam.classId } });
    const values = entries.map((item) => item.marks);

    return {
      exam: { id: exam.id, name: exam.name },
      subject: { id: subject.id, name: subject.name, code: subject.code },
      entries: entries.map(mapEntry),
      summary: {
        totalStudents: classStudents.length,
        marksEntered: entries.length,
        average: values.length ? Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)) : 0,
        highest: values.length ? Math.max(...values) : 0,
        lowest: values.length ? Math.min(...values) : 0,
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
      include: {
        exam: true,
        subject: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async bulkCreateMarks(data: BulkMarksInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const exam = await ensureExam(data.examId);
    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400);
    }

    await checkAccess(userId, permissions, data.examId, data.subjectId);
    await ensureSubjectInClass(data.subjectId, exam.classId);

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };

    for (const entry of data.entries) {
      try {
        ensureMarksWithinMax(entry.marks, entry.maxMarks ?? 100);
        await ensureStudentInClass(entry.studentId, exam.classId);

        await prisma.marks.upsert({
          where: {
            studentId_subjectId_examId: {
              studentId: entry.studentId,
              examId: data.examId,
              subjectId: data.subjectId,
            },
          },
          update: {
            marks: entry.marks,
            maxMarks: entry.maxMarks ?? 100,
            updatedById: userId,
          },
          create: {
            studentId: entry.studentId,
            examId: data.examId,
            subjectId: data.subjectId,
            marks: entry.marks,
            maxMarks: entry.maxMarks ?? 100,
            enteredById: userId,
          },
        });

        summary.successful += 1;
      } catch (error) {
        summary.failed += 1;
        summary.errors.push({
          studentId: entry.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    void logAudit({
      userId,
      action: 'BULK_MARKS_UPLOAD',
      entity: 'Marks',
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, successful: summary.successful, failed: summary.failed },
    });

    return summary;
  },

  async bulkUpdateMarks(data: BulkUpdateInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] };
    const first = data.updates[0];
    if (!first) {
      return summary;
    }

    const base = await prisma.marks.findUnique({ where: { id: first.id } });
    if (!base) {
      throw new AppError('First marks record not found', 404);
    }

    await checkAccess(userId, permissions, base.examId, base.subjectId);

    for (const item of data.updates) {
      try {
        const existing = await prisma.marks.findUnique({ where: { id: item.id } });
        if (!existing) {
          throw new AppError('Marks record not found', 404);
        }

        if (existing.examId !== base.examId || existing.subjectId !== base.subjectId) {
          throw new AppError('All updates must belong to the same exam and subject.', 400);
        }

        const exam = await ensureExam(existing.examId);
        ensureNotPublished(exam.status);
        ensureMarksWithinMax(item.marks, existing.maxMarks);

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
      action: 'BULK_MARKS_UPLOAD',
      entity: 'Marks',
      ipAddress,
      details: { batchType: 'UPDATE', successful: summary.successful, failed: summary.failed },
    });

    return summary;
  },

  async uploadMarksRows(
    examId: string,
    subjectId: string,
    rows: UploadRow[],
    userId: string,
    permissions: string[],
    ipAddress?: string,
  ): Promise<BatchSummary> {
    const mappedEntries: BulkMarksInput = {
      examId,
      subjectId,
      entries: [],
    };

    for (const row of rows) {
      const student = await prisma.student.findUnique({ where: { enrollmentNo: row.adm_no } });
      if (!student) {
        mappedEntries.entries.push({ studentId: 'unknown', marks: row.marks, remarks: row.remarks });
      } else {
        mappedEntries.entries.push({ studentId: student.id, marks: row.marks, remarks: row.remarks });
      }
    }

    const summary = await this.bulkCreateMarks(mappedEntries, userId, permissions, ipAddress);

    return summary;
  },

  async downloadTemplate(examId: string, subjectId: string): Promise<Array<{ adm_no: string; name: string }>> {
    const exam = await ensureExam(examId);
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return students.map((student) => ({
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
    }));
  },
};
