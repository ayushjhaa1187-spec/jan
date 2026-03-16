import AppError from '../../utils/AppError'
import { logAudit } from '../../utils/auditLogger'
import prisma from '../../utils/prisma'
import { createNotification, getUsersWithPermission } from '../notifications/notification.service'
import { CreateExamInput, ExamClassQuery, ExamListQuery, UpdateExamInput } from './exam.types'

const assertTransition = (from: string, to: 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'DRAFT'): void => {
  const valid =
    (from === 'DRAFT' && to === 'REVIEW') ||
    (from === 'REVIEW' && to === 'APPROVED') ||
    (from === 'APPROVED' && to === 'PUBLISHED') ||
    ((from === 'REVIEW' || from === 'APPROVED') && to === 'DRAFT')

  if (!valid) {
    throw new AppError(`Invalid status transition from ${from} to ${to}`, 400)
  }
}

const assertModifiable = (status: string): void => {
  if (status === 'PUBLISHED') {
    throw new AppError('Published exams cannot be modified', 400)
  }
}

const ensureClassExists = async (classId: string, orgId: string) => {
  const existingClass = await prisma.class.findFirst({ where: { id: classId, orgId } })
  if (!existingClass) {
    throw new AppError('Class not found or access denied', 404)
  }

  return existingClass
}

const getExamOrThrow = async (id: string, orgId: string) => {
  const exam = await prisma.exam.findFirst({ where: { id, orgId } })
  if (!exam) {
    throw new AppError('Exam not found or access denied', 404)
  }

  return exam
}

export const examService = {
  async createExam(data: CreateExamInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId, data.orgId)

    const duplicate = await prisma.exam.findFirst({
      where: {
        classId: data.classId,
        orgId: data.orgId,
        name: data.name,
        startDate: { gte: new Date(new Date(data.startDate).getFullYear(), 0, 1) },
        endDate: { lte: new Date(new Date(data.startDate).getFullYear(), 11, 31, 23, 59, 59, 999) },
      },
    })

    if (duplicate) {
      throw new AppError('Exam with this name already exists for class in this year', 409)
    }

    const created = await prisma.exam.create({
      data: {
        name: data.name,
        orgId: data.orgId,
        classId: data.classId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'DRAFT',
        createdById: userId,
      },
      include: { class: true },
    })

    void logAudit({
      userId,
      orgId: data.orgId,
      action: 'CREATE_EXAM',
      entity: 'Exam',
      entityId: created.id,
      ipAddress,
      details: { name: created.name, classId: created.classId },
    })

    return created
  },

  async getExams(params: ExamListQuery & { status?: string, orgId: string }) {
    const page = params.page && params.page > 0 ? params.page : 1
    const limit = params.limit && params.limit > 0 ? params.limit : 20
    const skip = (page - 1) * limit

    const where = {
      orgId: params.orgId,
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
    }

    const [total, data] = await Promise.all([
      prisma.exam.count({ where }),
      prisma.exam.findMany({
        where,
        include: { class: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  },

  async getExam(id: string, orgId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id, orgId },
      include: {
        class: true,
        createdBy: { select: { id: true, email: true } },
        updatedBy: { select: { id: true, email: true } },
        _count: { select: { marks: true, results: true } },
      },
    })

    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const logs = await prisma.auditLog.findMany({
      where: { entity: 'Exam', entityId: exam.id, action: { in: ['APPROVE_EXAM', 'PUBLISH_EXAM'] } },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const approver = logs.find((logItem) => logItem.action === 'APPROVE_EXAM')?.user || null
    const publisher = logs.find((logItem) => logItem.action === 'PUBLISH_EXAM')?.user || null

    return {
      ...exam,
      creator: exam.createdBy,
      approver,
      publisher,
    }
  },

  async updateExam(id: string, data: UpdateExamInput, userId: string, orgId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id, orgId)
    assertModifiable(exam.status)

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be updated', 400)
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
    })

    void logAudit({
      userId,
      action: 'UPDATE_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { name: updated.name },
    })

    return updated
  },

  async deleteExam(id: string, userId: string, orgId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id, orgId)
    assertModifiable(exam.status)

    if (exam.status !== 'DRAFT') {
      throw new AppError('Only draft exams can be deleted', 400)
    }

    await prisma.exam.delete({ where: { id } })

    void logAudit({ userId, action: 'DELETE_EXAM', entity: 'Exam', entityId: id, ipAddress })
  },

  async submitReview(id: string, userId: string, orgId: string, ipAddress?: string) {
    const exam = await prisma.exam.findFirst({
      where: { id, orgId },
      include: { subjects: true }
    })
    if (!exam) throw new AppError('Exam not found or access denied', 404)
    
    assertTransition(exam.status, 'REVIEW')

    // ABUSE PREVENTION: Only allow submission if subjects are added.
    if (!exam.subjects || exam.subjects.length === 0) {
      throw new AppError('Exams must have at least one subject assigned before submission for review.', 400)
    }

    const updated = await prisma.exam.update({
      where: { id },
      data: { status: 'REVIEW', updatedById: userId },
    })

    void logAudit({ userId, action: 'SUBMIT_EXAM_REVIEW', entity: 'Exam', entityId: id, ipAddress })

    const approvers = await getUsersWithPermission('approve_exam', orgId)
    await Promise.all(
      approvers.map((approverId) =>
        createNotification(approverId, 'Exam Pending Review', `${exam.name} submitted for review`, orgId),
      ),
    )

    return updated
  },

  async approveExam(id: string, userId: string, orgId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id, orgId)
    assertTransition(exam.status, 'APPROVED')

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedById: userId,
      },
    })

    void logAudit({ userId, action: 'APPROVE_EXAM', entity: 'Exam', entityId: id, ipAddress })
    await createNotification(exam.createdById, 'Exam Approved', `Your exam ${exam.name} has been approved`, orgId)

    return updated
  },

  async rejectExam(id: string, reason: string, userId: string, orgId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id, orgId)
    assertTransition(exam.status, 'DRAFT')

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'DRAFT',
        updatedById: userId,
      },
    })

    void logAudit({
      userId,
      action: 'REJECT_EXAM',
      entity: 'Exam',
      entityId: id,
      ipAddress,
      details: { reason },
    })

    await createNotification(exam.createdById, 'Exam Rejected', `Your exam ${exam.name} was rejected. Reason: ${reason}`, orgId)

    return updated
  },

  async publishExam(id: string, userId: string, orgId: string, ipAddress?: string) {
    const exam = await getExamOrThrow(id, orgId)
    assertTransition(exam.status, 'PUBLISHED')

    const updated = await prisma.exam.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        updatedById: userId,
      },
    })

    void logAudit({ userId, action: 'PUBLISH_EXAM', entity: 'Exam', entityId: id, ipAddress })
    return updated
  },

  async getMarksStatus(id: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ where: { id, orgId }, include: { class: true } })
    if (!exam) {
      throw new AppError('Exam not found or access denied', 404)
    }

    const [students, assignments] = await Promise.all([
      prisma.student.findMany({ where: { classId: exam.classId, orgId } }),
      prisma.teacherSubject.findMany({
        where: { 
          classId: exam.classId,
          teacher: { orgId } // Explicitly scope via relation
        },
        include: { subject: true, teacher: true },
      }),
    ])

    const totalStudents = students.length

    const subjects = await Promise.all(
      assignments.map(async (assignment) => {
        const marksEntered = await prisma.marks.count({
          where: {
            examId: exam.id,
            subjectId: assignment.subjectId,
            orgId
          },
        })

        const completionPercent = totalStudents > 0 ? (marksEntered / totalStudents) * 100 : 0

        return {
          subjectId: assignment.subjectId,
          subjectName: assignment.subject.name,
          subjectCode: assignment.subject.code,
          teacher: `${assignment.teacher.firstName} ${assignment.teacher.lastName}`,
          marksEntered,
          totalStudents,
          completionPercent: Number(completionPercent.toFixed(1)),
          isComplete: totalStudents > 0 && marksEntered >= totalStudents,
        }
      }),
    )

    return {
      exam,
      totalStudents,
      subjects,
    }
  },

  async getExamStudents(id: string, orgId: string) {
    const exam = await getExamOrThrow(id, orgId)

    return prisma.student.findMany({
      where: { classId: exam.classId, orgId },
      include: { class: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })
  },

  async getClassExams(classId: string, orgId: string, query: ExamClassQuery) {
    await ensureClassExists(classId, orgId)

    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const [total, data] = await Promise.all([
      prisma.exam.count({ where: { classId, orgId } }),
      prisma.exam.findMany({
        where: { classId, orgId },
        include: { class: true },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }
  },
}
