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

const ensureExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
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

const ensureStudentInClass = async (studentId: string, classId: string) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } })
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

const verifyTeacherAccess = async (userId: string, examId: string, subjectId: string): Promise<void> => {
  const teacher = await prisma.teacher.findUnique({ where: { userId } })
  if (!teacher) {
    throw new AppError('Teacher profile not found', 403)
  }

  const exam = await ensureExam(examId)

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
): Promise<void> => {
  if (!permissions.includes('manage_marks')) {
    await verifyTeacherAccess(userId, examId, subjectId)
  }
}

const upsertMarks = async (input: CreateMarksInput, userId: string) => {
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
  async createMarks(data: CreateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const exam = await ensureExam(data.examId)
    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400)
    }

    await checkWriteAccess(userId, permissions, data.examId, data.subjectId)
    await ensureSubjectClassAssignment(data.subjectId, exam.classId)
    await ensureStudentInClass(data.studentId, exam.classId)
    ensureMarksWithinMax(data.marks, data.maxMarks ?? 100)

    const saved = await upsertMarks(data, userId)

    void logAudit({
      userId,
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: saved.id,
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, studentId: data.studentId },
    })

    return saved
  },

  async updateMarks(id: string, data: UpdateMarksInput, userId: string, permissions: string[], ipAddress?: string) {
    const existing = await prisma.marks.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError('Marks record not found', 404)
    }

    const exam = await ensureExam(existing.examId)
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Marks for published exams cannot be modified.', 400)
    }

    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId)
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
      action: 'ENTER_MARKS',
      entity: 'Marks',
      entityId: id,
      ipAddress,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
    })

    return updated
  },

  async deleteMarks(id: string, userId: string, permissions: string[], ipAddress?: string): Promise<void> {
    const existing = await prisma.marks.findUnique({ where: { id } })
    if (!existing) {
      throw new AppError('Marks record not found', 404)
    }

    const exam = await ensureExam(existing.examId)
    if (exam.status === 'PUBLISHED') {
      throw new AppError('Marks for published exams cannot be modified.', 400)
    }

    await checkWriteAccess(userId, permissions, existing.examId, existing.subjectId)
    await prisma.marks.delete({ where: { id } })

    void logAudit({
      userId,
      action: 'DELETE_MARKS',
      entity: 'Marks',
      entityId: id,
      ipAddress,
      details: { examId: existing.examId, subjectId: existing.subjectId, studentId: existing.studentId },
    })
  },

  async getMarks(id: string) {
    const marks = await prisma.marks.findUnique({
      where: { id },
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

  async getExamMarks(examId: string) {
    await ensureExam(examId)

    return prisma.marks.findMany({
      where: { examId },
      include: { student: true, subject: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getExamSubjectMarks(examId: string, subjectId: string) {
    const exam = await ensureExam(examId)
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) {
      throw new AppError('Subject not found', 404)
    }

    const entries = await prisma.marks.findMany({
      where: { examId, subjectId },
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    })

    const students = await prisma.student.findMany({ where: { classId: exam.classId } })
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

  async getStudentMarks(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } })
    if (!student) {
      throw new AppError('Student not found', 404)
    }

    return prisma.marks.findMany({
      where: { studentId },
      include: { exam: true, subject: true },
      orderBy: { createdAt: 'desc' },
    })
  },

  async bulkCreateMarks(data: BulkMarksInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const exam = await ensureExam(data.examId)
    if (exam.status !== 'APPROVED') {
      throw new AppError('Marks can only be entered for APPROVED exams.', 400)
    }

    await checkWriteAccess(userId, permissions, data.examId, data.subjectId)
    await ensureSubjectClassAssignment(data.subjectId, exam.classId)

    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] }

    for (const entry of data.entries) {
      try {
        await ensureStudentInClass(entry.studentId, exam.classId)
        ensureMarksWithinMax(entry.marks, entry.maxMarks ?? 100)

        await upsertMarks(
          {
            studentId: entry.studentId,
            examId: data.examId,
            subjectId: data.subjectId,
            marks: entry.marks,
            maxMarks: entry.maxMarks,
            remarks: entry.remarks,
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
      action: 'BULK_MARKS_UPLOAD',
      entity: 'Marks',
      ipAddress,
      details: { examId: data.examId, subjectId: data.subjectId, successful: summary.successful, failed: summary.failed },
    })

    return summary
  },

  async bulkUpdateMarks(data: BulkUpdateInput, userId: string, permissions: string[], ipAddress?: string): Promise<BatchSummary> {
    const summary: BatchSummary = { successful: 0, failed: 0, errors: [] }

    if (data.updates.length === 0) {
      return summary
    }

    const first = await prisma.marks.findUnique({ where: { id: data.updates[0].id } })
    if (!first) {
      throw new AppError('First marks record not found', 404)
    }

    await checkWriteAccess(userId, permissions, first.examId, first.subjectId)

    for (const item of data.updates) {
      try {
        const existing = await prisma.marks.findUnique({ where: { id: item.id } })
        if (!existing) {
          throw new AppError('Marks record not found', 404)
        }

        if (existing.examId !== first.examId || existing.subjectId !== first.subjectId) {
          throw new AppError('All updates must belong to the same exam and subject.', 400)
        }

        const exam = await ensureExam(existing.examId)
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
    permissions: string[],
    ipAddress?: string,
  ): Promise<BatchSummary> {
    const entries = await Promise.all(
      rows.map(async (row) => {
        const student = await prisma.student.findUnique({ where: { enrollmentNo: row.adm_no } })
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

    return this.bulkCreateMarks({ examId, subjectId, entries }, userId, permissions, ipAddress)
  },

  async downloadTemplate(examId: string, subjectId: string) {
    const exam = await ensureExam(examId)
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })

    if (!subject) {
      throw new AppError('Subject not found', 404)
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    })

    return students.map((student) => ({
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
    }))
  },
}
