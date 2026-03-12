import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { createNotification, getUsersWithPermission } from '../notifications/notification.service';
import {
  CreateExamInput,
  ExamClassQuery,
  ExamListQuery,
  ExamWorkflowStatus,
  RejectExamInput,
  UpdateExamInput,
} from './exam.types';

const WORKFLOW_STATUSES: ExamWorkflowStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'];

const assertValidStatus = (value: string): void => {
  if (!WORKFLOW_STATUSES.includes(value as ExamWorkflowStatus)) {
    throw new AppError('Invalid exam status', 400);
  }
};

const getExamOrThrow = async (id: string) => {
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

const ensureClassExists = async (classId: string) => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  return classItem;
};

const ensureTransition = (from: string, to: ExamWorkflowStatus): void => {
  if (from === 'PUBLISHED') {
    throw new AppError('Published exams cannot be modified', 400);
  }

  const valid =
    (from === 'DRAFT' && to === 'REVIEW') ||
    (from === 'REVIEW' && to === 'APPROVED') ||
    ((from === 'REVIEW' || from === 'APPROVED') && to === 'DRAFT') ||
    (from === 'APPROVED' && to === 'PUBLISHED');

  if (!valid) {
    throw new AppError(`Invalid status transition from ${from} to ${to}`, 400);
  }
};

const includeExamMeta = {
  class: true,
  createdBy: { select: { id: true, email: true } },
  _count: { select: { marks: true, results: true } },
} as const;

export const examService = {
  async createExam(data: CreateExamInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId);

    const year = new Date(data.startDate).getUTCFullYear();
    const sameName = await prisma.exam.findFirst({
      where: {
        classId: data.classId,
        name: data.name,
        startDate: { gte: new Date(`${year}-01-01T00:00:00.000Z`), lte: new Date(`${year}-12-31T23:59:59.999Z`) },
      },
    });

    if (sameName) {
      throw new AppError('Exam with this name already exists for this class and year', 409);
    }

    const exam = await prisma.exam.create({
      data: {
        name: data.name,
        classId: data.classId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'DRAFT',
        createdById: userId,
      },
      include: includeExamMeta,
    });

    void logAudit({
      userId,
      action: 'CREATE_EXAM',
      entity: 'Exam',
      entityId: exam.id,
      ipAddress,
      details: { name: exam.name, classId: exam.classId },
    });

    return exam;
  },

  async getExams(params: ExamListQuery) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.classId ? { classId: params.classId } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { name: { contains: params.search, mode: 'insensitive' as const } } : {}),
      ...((params.startDate || params.endDate)
        ? {
            startDate: {
              ...(params.startDate ? { gte: new Date(params.startDate) } : {}),
              ...(params.endDate ? { lte: new Date(params.endDate) } : {}),
            },
          }
        : {}),
    };

    const [total, exams] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        include: { class: true, _count: { select: { marks: true, results: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: exams,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getExam(id: string) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: includeExamMeta,
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const logs = await prisma.auditLog.findMany({
      where: {
        entity: 'Exam',
        entityId: exam.id,
        action: { in: ['APPROVE_EXAM', 'PUBLISH_EXAM'] },
      },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...exam,
      approver: logs.find((item) => item.action === 'APPROVE_EXAM')?.user || null,
      publisher: logs.find((item) => item.action === 'PUBLISH_EXAM')?.user || null,
    };
  },

  async updateExam(id: string, data: UpdateExamInput, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Published exams cannot be modified', 400);
    }

    if (exam.status !== 'DRAFT') {
      throw new AppError('Invalid status transition from ' + exam.status + ' to DRAFT_UPDATE', 400);
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
        updatedById: userId,
      },
      include: includeExamMeta,
    });

    void logAudit({
      userId,
      action: 'UPDATE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { name: updated.name },
    });

    return updated;
  },

  async deleteExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Published exams cannot be modified', 400);
    }

    if (exam.status !== 'DRAFT') {
      throw new AppError('Invalid status transition from ' + exam.status + ' to DELETED', 400);
    }

    await prisma.exam.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { name: exam.name },
    });
  },

  async submitReview(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    ensureTransition(exam.status, 'REVIEW');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'REVIEW', updatedById: userId },
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'SUBMIT_EXAM_REVIEW',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { name: exam.name },
    });

    const approverIds = await getUsersWithPermission('approve_exam');
    await Promise.all(
      approverIds.map((approverId) =>
        createNotification(
          approverId,
          'Exam Pending Review',
          `${exam.name} submitted for review`,
        ),
      ),
    );

    return updated;
  },

  async approveExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    ensureTransition(exam.status, 'APPROVED');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'APPROVED', updatedById: userId },
      include: includeExamMeta,
    });

    void logAudit({
      userId,
      action: 'APPROVE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
    });

    await createNotification(exam.createdById, 'Exam Approved', `Your exam ${exam.name} has been approved`);

    return updated;
  },

  async rejectExam(id: string, payload: RejectExamInput, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    ensureTransition(exam.status, 'DRAFT');

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'DRAFT',
        updatedById: userId,
      },
      include: includeExamMeta,
    });

    void logAudit({
      userId,
      action: 'REJECT_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { reason: payload.reason },
    });

    await createNotification(
      exam.createdById,
      'Exam Rejected',
      `Your exam ${exam.name} was rejected. Reason: ${payload.reason}`,
    );

    return updated;
  },

  async publishExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    ensureTransition(exam.status, 'PUBLISHED');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'PUBLISHED', updatedById: userId },
      include: includeExamMeta,
    });

    void logAudit({
      userId,
      action: 'PUBLISH_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
    });

    return updated;
  },

  async getMarksStatus(id: string) {
    const exam = await prisma.exam.findUnique({ where: { id }, include: { class: true } });
    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    assertValidStatus(exam.status);

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });
    const totalStudents = students.length;

    const assignments = await prisma.teacherSubject.findMany({
      where: { classId: exam.classId },
      include: { subject: true, teacher: true },
    });

    const subjects = await Promise.all(
      assignments.map(async (assignment) => {
        const marksEntered = await prisma.marks.count({
          where: { examId: exam.id, subjectId: assignment.subjectId },
        });

        const completionPercent = totalStudents > 0 ? Number(((marksEntered / totalStudents) * 100).toFixed(1)) : 0;

        return {
          subjectId: assignment.subjectId,
          subjectName: assignment.subject.name,
          subjectCode: assignment.subject.code,
          teacher: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
          marksEntered,
          totalStudents,
          completionPercent,
        };
      }),
    );

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        status: exam.status,
        class: exam.class,
      },
      totalStudents,
      subjects,
    };
  },

  async getExamStudents(id: string) {
    const exam = await getExamOrThrow(id);

    return prisma.student.findMany({
      where: { classId: exam.classId },
      include: { class: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  },

  async getClassExams(classId: string, query: ExamClassQuery) {
    await ensureClassExists(classId);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.exam.count({ where: { classId } }),
      prisma.exam.findMany({
        where: { classId },
        include: { class: true, _count: { select: { marks: true, results: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
