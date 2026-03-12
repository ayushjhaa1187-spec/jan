import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { createNotification, getUsersWithPermission } from '../notifications/notification.service';
import { logAudit } from '../../utils/auditLogger';
import {
  CreateExamInput,
  ExamClassQuery,
  ExamListQuery,
  ExamWorkflowStatus,
  RejectExamInput,
  UpdateExamInput,
} from './exam.types';

const WORKFLOW_STATUSES: ExamWorkflowStatus[] = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'];

const isWorkflowStatus = (value: string): value is ExamWorkflowStatus =>
  WORKFLOW_STATUSES.includes(value as ExamWorkflowStatus);

const assertModifiable = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Published exams cannot be modified.', 400);
  }
};

const getExamByIdOrThrow = async (id: string) => {
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
    throw new AppError('Published exams cannot be modified.', 400);
  }

  const valid =
    (from === 'DRAFT' && to === 'REVIEW') ||
    (from === 'REVIEW' && to === 'APPROVED') ||
    (from === 'APPROVED' && to === 'PUBLISHED');

  if (!valid) {
    throw new AppError(`Invalid status transition from ${from} to ${to}`, 400);
  }
};

const buildExamDetail = async (id: string) => {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: true,
      createdBy: { select: { id: true, email: true } },
      _count: { select: { marks: true, results: true } },
    },
  });

  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: 'EXAM',
      entityId: id,
      action: { in: ['EXAM_APPROVED', 'EXAM_PUBLISHED'] },
    },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const approveLog = logs.find((item) => item.action === 'EXAM_APPROVED');
  const publishLog = logs.find((item) => item.action === 'EXAM_PUBLISHED');

  return {
    id: exam.id,
    name: exam.name,
    status: exam.status,
    startDate: exam.startDate,
    endDate: exam.endDate,
    class: {
      id: exam.class.id,
      name: exam.class.name,
      section: exam.class.section,
    },
    creator: exam.createdBy,
    approver: approveLog?.user || null,
    publisher: publishLog?.user || null,
    _count: exam._count,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
  };
};

export const examService = {
  async createExam(payload: CreateExamInput, userId: string, ipAddress?: string) {
    await ensureClassExists(payload.classId);

    const duplicate = await prisma.exam.findFirst({
      where: {
        classId: payload.classId,
        name: payload.name,
      },
    });

    if (duplicate) {
      throw new AppError('Exam with this name already exists for this class', 409);
    }

    const created = await prisma.exam.create({
      data: {
        name: payload.name,
        classId: payload.classId,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        status: 'DRAFT',
        createdById: userId,
      },
      include: {
        class: true,
      },
    });

    void logAudit({
      userId,
      action: 'CREATE_EXAM',
      entity: 'Exam',
      entityId: created.id,
      details: { examName: created.name },
      ipAddress,
    });

    return created;
  },

  async listExams(query: ExamListQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
      ...((query.startDate || query.endDate)
        ? {
            startDate: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        include: { class: true },
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

  async getExamById(id: string) {
    return buildExamDetail(id);
  },

  async updateExam(id: string, payload: UpdateExamInput, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);
    assertModifiable(exam.status);

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be updated.', 400);
    }

    const nextStartDate = payload.startDate ? new Date(payload.startDate) : exam.startDate;
    const nextEndDate = payload.endDate ? new Date(payload.endDate) : exam.endDate;

    if (nextEndDate <= nextStartDate) {
      throw new AppError('endDate must be after startDate', 400);
    }

    if (payload.name && payload.name !== exam.name) {
      const duplicate = await prisma.exam.findFirst({
        where: {
          classId: exam.classId,
          name: payload.name,
          NOT: { id: exam.id },
        },
      });

      if (duplicate) {
        throw new AppError('Exam with this name already exists for this class', 409);
      }
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.startDate ? { startDate: new Date(payload.startDate) } : {}),
        ...(payload.endDate ? { endDate: new Date(payload.endDate) } : {}),
        updatedById: userId,
      },
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'UPDATE_EXAM',
      entity: 'Exam',
      entityId: updated.id,
      ipAddress,
    });

    return updated;
  },

  async deleteExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);
    assertModifiable(exam.status);

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be deleted.', 400);
    }

    await prisma.exam.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
    });
  },

  async submitReview(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);
    ensureTransition(exam.status, 'REVIEW');

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'REVIEW',
        updatedById: userId,
      },
    });

    void logAudit({
      userId,
      action: 'SUBMIT_EXAM_REVIEW',
      entity: 'Exam',
      entityId: id,
      ipAddress,
    });

    const approverIds = await getUsersWithPermission('approve_exam');
    await Promise.all(
      approverIds.map((approverId) =>
        createNotification(
          approverId,
          'Exam Pending Review',
          `${updated.name} for Class ${updated.classId} has been submitted for review.`,
        ),
      ),
    );

    return updated;
  },

  async approve(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);
    ensureTransition(exam.status, 'APPROVED');

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedById: userId,
      },
    });

    void logAudit({
      userId,
      action: 'APPROVE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
    });

    await createNotification(exam.createdById, 'Exam Approved', `Your exam ${updated.name} has been approved.`);

    return updated;
  },

  async reject(id: string, payload: RejectExamInput, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);

    if (exam.status === 'PUBLISHED') {
      throw new AppError('Published exams cannot be modified.', 400);
    }

    if (!(exam.status === 'REVIEW' || exam.status === 'APPROVED')) {
      throw new AppError(`Invalid status transition from ${exam.status} to DRAFT`, 400);
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'DRAFT',
        updatedById: userId,
      },
    });

    void logAudit({
      userId,
      action: 'REJECT_EXAM',
      entity: 'Exam',
      entityId: id,
      details: { reason: payload.reason },
      ipAddress,
    });

    await createNotification(
      exam.createdById,
      'Exam Rejected',
      `Your exam ${updated.name} was rejected. Reason: ${payload.reason}`,
    );

    return {
      exam: updated,
      reason: payload.reason,
    };
  },

  async publish(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamByIdOrThrow(id);
    ensureTransition(exam.status, 'PUBLISHED');

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        updatedById: userId,
      },
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
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });
    const totalStudents = students.length;

    const assignments = await prisma.teacherSubject.findMany({
      where: { classId: exam.classId },
      include: {
        subject: true,
        teacher: true,
      },
    });

    const subjects = await Promise.all(
      assignments.map(async (assignment) => {
        const marksEntered = await prisma.marks.count({
          where: {
            examId: exam.id,
            subjectId: assignment.subjectId,
          },
        });

        const completionPercent = totalStudents > 0 ? (marksEntered / totalStudents) * 100 : 0;

        return {
          subjectId: assignment.subjectId,
          subjectName: assignment.subject.name,
          subjectCode: assignment.subject.code,
          teacher: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
          marksEntered,
          totalStudents,
          completionPercent: Number(completionPercent.toFixed(1)),
          isComplete: totalStudents > 0 && marksEntered >= totalStudents,
        };
      }),
    );

    const overallCompletion =
      subjects.length > 0
        ? Number((subjects.reduce((sum, item) => sum + item.completionPercent, 0) / subjects.length).toFixed(1))
        : 0;

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        status: isWorkflowStatus(exam.status) ? exam.status : exam.status,
        class: {
          name: exam.class.name,
          section: exam.class.section,
        },
      },
      totalStudents,
      subjects,
      overallCompletion,
    };
  },

  async getExamStudents(id: string) {
    const exam = await getExamByIdOrThrow(id);

    return prisma.student.findMany({
      where: { classId: exam.classId },
      include: {
        class: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  },

  async getExamsByClass(classId: string, query: ExamClassQuery) {
    await ensureClassExists(classId);

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.exam.count({ where: { classId } }),
      prisma.exam.findMany({
        where: { classId },
        include: { class: true },
        orderBy: { startDate: 'desc' },
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
