import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { createNotification, getUsersWithPermission } from '../notifications/notification.service';
import { CreateExamInput, ExamClassQuery, ExamListQuery, UpdateExamInput } from './exam.types';

const assertNotPublished = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Published exams cannot be modified', 400);
  }
};

const assertTransition = (from: string, to: string): void => {
  const valid =
    (from === 'DRAFT' && to === 'REVIEW') ||
    (from === 'REVIEW' && to === 'APPROVED') ||
    ((from === 'REVIEW' || from === 'APPROVED') && to === 'DRAFT') ||
    (from === 'APPROVED' && to === 'PUBLISHED');

  if (!valid) {
    throw new AppError(`Invalid status transition from ${from} to ${to}`, 400);
  }
};

const getExamOrThrow = async (id: string) => {
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

const ensureClassExists = async (classId: string): Promise<void> => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }
};

const getClassLabel = async (classId: string): Promise<string> => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    return classId;
  }

  return `${classItem.name}${classItem.section ? ` ${classItem.section}` : ''}`;
};

export const examService = {
  async createExam(data: CreateExamInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId);

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    const existing = await prisma.exam.findFirst({
      where: {
        classId: data.classId,
        name: data.name,
      },
    });

    if (existing) {
      throw new AppError('Exam with this name already exists for this class', 409);
    }

    const created = await prisma.exam.create({
      data: {
        name: data.name,
        classId: data.classId,
        startDate,
        endDate,
        status: 'DRAFT',
        createdById: userId,
      },
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'CREATE_EXAM',
      entity: 'Exam',
      entityId: created.id,
      details: { name: created.name, classId: created.classId },
      ipAddress,
    });

    return created;
  },

  async getExams(query: ExamListQuery & { status?: string }) {
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

  async getExam(id: string) {
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
        entity: 'Exam',
        entityId: id,
        action: { in: ['APPROVE_EXAM', 'PUBLISH_EXAM'] },
      },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const approver = logs.find((item) => item.action === 'APPROVE_EXAM')?.user || null;
    const publisher = logs.find((item) => item.action === 'PUBLISH_EXAM')?.user || null;

    return {
      ...exam,
      approver,
      publisher,
    };
  },

  async updateExam(id: string, data: UpdateExamInput, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertNotPublished(exam.status);

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be updated', 400);
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.endDate ? { endDate: new Date(data.endDate) } : {}),
        updatedById: userId,
      },
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'UPDATE_EXAM',
      entity: 'Exam',
      entityId: updated.id,
      details: { name: updated.name },
      ipAddress,
    });

    return updated;
  },

  async deleteExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertNotPublished(exam.status);

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be deleted', 400);
    }

    await prisma.exam.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_EXAM',
      entity: 'Exam',
      entityId: id,
      details: { name: exam.name },
      ipAddress,
    });
  },

  async submitReview(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertTransition(exam.status, 'REVIEW');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'REVIEW', updatedById: userId },
    });

    void logAudit({
      userId,
      action: 'SUBMIT_EXAM_REVIEW',
      entity: 'Exam',
      entityId: id,
      details: { name: exam.name },
      ipAddress,
    });

    const users = await getUsersWithPermission('approve_exam');
    const classLabel = await getClassLabel(exam.classId);
    await Promise.all(
      users.map((targetUserId) =>
        createNotification(
          targetUserId,
          'Exam Pending Review',
          `${exam.name} submitted for review for Class ${classLabel}.`,
        ),
      ),
    );

    return updated;
  },

  async approveExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertTransition(exam.status, 'APPROVED');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'APPROVED', updatedById: userId },
    });

    void logAudit({
      userId,
      action: 'APPROVE_EXAM',
      entity: 'Exam',
      entityId: id,
      details: { name: exam.name },
      ipAddress,
    });

    await createNotification(exam.createdById, 'Exam Approved', `Your exam ${exam.name} has been approved.`);

    return updated;
  },

  async rejectExam(id: string, reason: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertNotPublished(exam.status);
    assertTransition(exam.status, 'DRAFT');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'DRAFT', updatedById: userId },
    });

    void logAudit({
      userId,
      action: 'REJECT_EXAM',
      entity: 'Exam',
      entityId: id,
      details: { reason },
      ipAddress,
    });

    await createNotification(
      exam.createdById,
      'Exam Rejected',
      `Your exam ${exam.name} was rejected. Reason: ${reason}`,
    );

    return { exam: updated, reason };
  },

  async publishExam(id: string, userId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id);
    assertTransition(exam.status, 'PUBLISHED');

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'PUBLISHED', updatedById: userId },
    });

    void logAudit({
      userId,
      action: 'PUBLISH_EXAM',
      entity: 'Exam',
      entityId: id,
      details: { name: exam.name },
      ipAddress,
    });

    return updated;
  },

  async getMarksStatus(id: string) {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { class: true },
    });

    if (!exam) {
      throw new AppError('Exam not found', 404);
    }

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
          teacherName: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
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
