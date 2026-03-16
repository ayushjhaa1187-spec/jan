import AppError from '../../utils/AppError'
import { logAudit } from '../../utils/auditLogger'
import prisma from '../../utils/prisma'
import {
  BatchSummary,
  BulkMarksInput,
  BulkUpdateInput,
  CreateMarksInput,
  UpdateMarksInput,
  UploadRow,
} from './marks.types'

const ensureExam = async (examId: string, orgId: string) => {
  const exam = await prisma.exam.findFirst({ where: { id: examId, orgId } })
  if (!exam) {
    throw new AppError('Exam not found', 404)
  }

  return exam
}

const ensureSubjectClassAssignment = async (subjectId: string, classId: string) => {
  const assignment = await prisma.teacherSubject.findFirst({ where: { subjectId, classId } })
  if (!assignment) {
    throw new AppError('This subject is not assigned to this class.', 400)
  }
}

const ensureStudentInClass = async (studentId: string, classId: string, orgId: string) => {
  const student = await prisma.student.findFirst({ where: { id: studentId, orgId } })
  if (!student) {
    throw new AppError('Student not found', 404)
  }

  if (student.classId !== classId) {
    throw new AppError("Student does not belong to the exam's class.", 400)
  }

  return student
}

const ensureMarksWithinMax = (marks: number, maxMarks: number): void => {
  if (marks > maxMarks) {
    throw new AppError('Marks cannot exceed maximum marks.', 400)
  }
}

const verifyTeacherAccess = async (userId: string, examId: string, subjectId: string, orgId: string): Promise<void> => {
  const teacher = await prisma.teacher.findFirst({ where: { userId, orgId } })
  if (!teacher) {
    throw new AppError('Teacher profile not found', 403)
  }

  const exam = await ensureExam(examId, orgId)

  const assignment = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher.id,
      subjectId,
      classId: exam.classId,
    },
  })

  if (!assignment) {
    throw new AppError('Access denied. You are not assigned to teach this subject in this class.', 403)
  }
}

const checkWriteAccess = async (
  userId: string,
  permissions: string[],
  examId: string,
  subjectId: string,
  orgId: string,
): Promise<void> => {
  if (!permissions.includes('manage_marks')) {
    await verifyTeacherAccess(userId, examId, subjectId, orgId)
  }
}

const upsertMarks = async (input: CreateMarksInput & { orgId: string }, userId: string) => {
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
      updatedById: userId,
    },
    create: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      examId: input.examId,
      orgId: input.orgId,
      marks: input.marks,
      maxMarks: input.maxMarks ?? 100,
      enteredById: userId,
    },
    include: {
      student: true,
      subject: true,
      exam: true,
    },
  })
}

export const marksService = {
  async createMarks(data: CreateMarksInput, userId: string, orgId: string, permissions: string[], ipAddress?: string) {
    const exam = await ensureExam(data.examId, orgId)
    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400)
    }

    await checkWriteAccess(userId, permissions, data.examId, data.subjectId, orgId)
    await ensureSubjectClassAssignment(data.subjectId, exam.classId)
    await ensureStudentInClass(data.studentId, exam.classId, orgId)
    ensureMarksWithinMax(data.marks, data.maxMarks ?? 100)

    const saved = await upsertMarks({ ...data, orgId }, userId)

    void logAudit({
      userId,
      orgId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: saved.id,
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, studentId: data.studentId },
    })

    return saved
  },

  async updateMarks(id: string, data: UpdateMarksInput, userId: string, orgId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findFirst({ 
      where: { 
        id,
        exam: { orgId }
      } 
    })
    if (!existing) {
      throw new AppError('Marks record not found', 404)
    }

    const exam = await ensureExam(existing.examId, orgId)
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Marks for published exams cannot be modified.', 400)
    }

    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId, orgId)
    ensureMarksWithinMax(data.marks, existing.maxMarks)

    const updated = await prisma.marks.update({
      where: { id },
      data: {
        marks: data.marks,
        updatedById: userId,
      },
      include: {
        student: true,
        subject: true,
        exam: true,
      },
    })

    void logAudit({
      userId,
      orgId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: id,
      ipAddress,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
    })

    return updated
  },

  async deleteMarks(id: string, userId: string, orgId: string, permissions: string[], ipAddress?: string): Promise<void> {
    const existing = await prisma.marks.findFirst({ 
      where: { 
        id,
        exam: { orgId }
      } 
    })
    if (!existing) {
      throw new AppError('Marks record not found', 404)
    }

    const exam = await ensureExam(existing.examId, orgId)
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Marks for published exams cannot be modified.', 400)
    }

    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId, orgId)
    await prisma.marks.delete({ where: { id } })

    void logAudit({
      userId,
      orgId,
      action: 'DELETE_MARKS',
      entity: 'Marks',
      entityId: id,
      ipAddress,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
    })
  },

  async getMarks(id: string, orgId: string) {
    const marks = await prisma.marks.findFirst({
      where: { 
        id,
        exam: { orgId }
      },
      include: {
        student: true,
        subject: true,
        exam: true,
      },
    })

    if (!marks) {
      throw new AppError('Marks record not found', 404)
    }

    return marks
  },

  async getExamMarks(examId: string, orgId: string) {
    await ensureExam(examId, orgId)

    return prisma.marks.findMany({
      where: { 
        examId,
        exam: { orgId }
      },
      include: { student: true, subject: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getExamSubjectMarks(examId: string, subjectId: string, orgId: string) {
    const exam = await ensureExam(examId, orgId)
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, orgId } })
    if (!subject) {
      throw new AppError('Subject not found', 404)
    }

    const entries = await prisma.marks.findMany({
      where: { 
        examId, 
        subjectId,
        exam: { orgId }
      },
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    })

    const students = await prisma.student.findMany({ where: { classId: exam.classId, orgId } })
    const marksValues = entries.map((entry) => entry.marks)

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
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      summary: {
        totalStudents: students.length,
        marksEntered: entries.length,
        average:
          marksValues.length > 0
            ? Number((marksValues.reduce((sum, value) => sum + value, 0) / marksValues.length).toFixed(2))
            : 0,
        highest: marksValues.length > 0 ? Math.max(...marksValues) : 0,
        lowest: marksValues.length > 0 ? Math.min(...marksValues) : 0,
      },
    }
  },

  async getStudentMarks(studentId: string, orgId: string) {
    const student = await prisma.student.findFirst({ where: { id: studentId, orgId } })
    if (!student) {
      throw new AppError('Student not found', 404)
    }

    return prisma.marks.findMany({
      where: { 
        studentId,
        student: { orgId }
      },
      include: { exam: true, subject: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async bulkCreateMarks(data: BulkMarksInput, userId: string, orgId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const exam = await ensureExam(data.examId, orgId)
    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400)
    }

    await checkWriteAccess(userId, permissions, data.examId, data.subjectId, orgId)
    await ensureSubjectClassAssignment(data.subjectId, exam.classId)

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] }

    for (const entry of data.entries) {
      try {
        await ensureStudentInClass(entry.studentId, exam.classId, orgId)
        ensureMarksWithinMax(entry.marks, entry.maxMarks ?? 100)

        await upsertMarks(
          {
            studentId: entry.studentId,
            examId: data.examId,
            subjectId: data.subjectId,
            marks: entry.marks,
            maxMarks: entry.maxMarks,
            remarks: entry.remarks,
            orgId,
          },
          userId,
        )

        summary.successful += 1
      } catch (error) {
        summary.failed += 1
        summary.errors.push({
          studentId: entry.studentId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    void logAudit({
      userId,
      orgId,
      action: 'BULK_MARKS_UPLOAD',
      entity: 'Marks',
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, successful: summary.successful, failed: summary.failed },
    })

    return summary
  },

  async bulkUpdateMarks(data: BulkUpdateInput, userId: string, orgId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] }

    if (data.updates.length === 0) {
      return summary
    }

    const first = await prisma.marks.findFirst({ 
      where: { 
        id: data.updates[0].id,
        exam: { orgId }
      } 
    })
    if (!first) {
      throw new AppError('First marks record not found', 404)
    }

    await checkWriteAccess(userId, permissions, first.examId, first.subjectId, orgId)

    for (const item of data.updates) {
      try {
        const existing = await prisma.marks.findFirst({ 
          where: { 
            id: item.id,
            exam: { orgId }
          } 
        })
        if (!existing) {
          throw new AppError('Marks record not found', 404)
        }

        if (existing.examId !== first.examId || existing.subjectId !== first.subjectId) {
          throw new AppError('All updates must belong to the same exam and subject.', 400)
        }

        const exam = await ensureExam(existing.examId, orgId)
        if (exam.status === 'PUBLISHED') {
          throw new AppError('Marks for published exams cannot be modified.', 400)
        }

        ensureMarksWithinMax(item.marks, existing.maxMarks)

        await prisma.marks.update({
          where: { id: item.id },
          data: {
            marks: item.marks,
            updatedById: userId,
          },
        })

        summary.successful += 1
      } catch (error) {
        summary.failed += 1
        summary.errors.push({
          studentId: item.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    void logAudit({
      userId,
      orgId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      ipAddress,
      details: { successful: summary.successful, failed: summary.failed },
    })

    return summary
  },

  async uploadMarksRows(
    examId: string,
    subjectId: string,
    rows: UploadRow[],
    userId: string,
    orgId: string,
    permissions: string[],
    ipAddress?: string,
  ): Promise<BatchSummary> {
    const entries = await Promise.all(
      rows.map(async (row) => {
        const student = await prisma.student.findFirst({ where: { enrollmentNo: row.adm_no, orgId } })
        if (!student) {
          throw new AppError(`Student admission number not found: ${row.adm_no}`, 404)
        }

        return {
          studentId: student.id,
          marks: row.marks,
          remarks: row.remarks,
          maxMarks: 100,
        }
      }),
    )

    return this.bulkCreateMarks({ examId, subjectId, entries }, userId, orgId, permissions, ipAddress)
  },

  async downloadTemplate(examId: string, subjectId: string, orgId: string) {
    const exam = await ensureExam(examId, orgId)
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, orgId } })

    if (!subject) {
      throw new AppError('Subject not found', 404)
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId, orgId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    return students.map((student) => ({
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
    }))
  },
}
