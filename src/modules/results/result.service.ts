import AppError from '../../utils/AppError'
import { logAudit } from '../../utils/auditLogger'
import prisma from '../../utils/prisma'
import { createNotification } from '../notifications/notification.service'
import { ResultListQuery } from './result.types'

const gradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}

export const resultService = {
  async listResults(query: ResultListQuery) {
    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const where = {
      ...(query.examId ? { examId: query.examId } : {}),
      ...(query.status ? { status: query.status } : {}),
    }

    const [total, data] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.findMany({
        where,
        include: {
          student: { include: { class: true } },
          exam: true,
        },
        orderBy: [{ createdAt: 'desc' }],
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

  async getExamResults(examId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const results = await prisma.result.findMany({
      where: { examId },
      include: {
        student: { include: { class: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return results.map((resultItem, index) => ({
      id: resultItem.id,
      studentId: resultItem.studentId,
      rank: index + 1,
      status: resultItem.status,
      grade: resultItem.remarks?.split('|')[0] || 'N/A',
      percentage: Number(resultItem.remarks?.split('|')[1] || 0),
      student: resultItem.student,
    }))
  },

  async getSummary(examId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const classStudents = await prisma.student.count({ where: { classId: exam.classId } })
    const resultRows = await prisma.result.findMany({ where: { examId } })

    const percentages = resultRows
      .map((item) => Number(item.remarks?.split('|')[1] || 0))
      .filter((item) => !Number.isNaN(item))

    const passed = percentages.filter((item) => item >= 40).length
    const failed = percentages.filter((item) => item < 40).length
    const incomplete = Math.max(classStudents - resultRows.length, 0)
    const averagePercentage = percentages.length > 0
      ? Number((percentages.reduce((sum, item) => sum + item, 0) / percentages.length).toFixed(2))
      : 0

    return {
      total: classStudents,
      passed,
      failed,
      incomplete,
      averagePercentage,
      passRate: classStudents > 0 ? Number(((passed / classStudents) * 100).toFixed(2)) : 0,
    }
  },

  async generateResults(examId: string, userId: string, ipAddress?: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const students = await prisma.student.findMany({ where: { classId: exam.classId } })

    for (const student of students) {
      const marks = await prisma.marks.findMany({ where: { examId, studentId: student.id } })
      if (marks.length === 0) {
        continue
      }

      const obtained = marks.reduce((sum, row) => sum + row.marks, 0)
      const maxTotal = marks.reduce((sum, row) => sum + row.maxMarks, 0)
      const percentage = maxTotal > 0 ? (obtained / maxTotal) * 100 : 0
      const grade = gradeFromPercentage(percentage)

      await prisma.result.upsert({
        where: { studentId_examId: { studentId: student.id, examId } },
        create: {
          studentId: student.id,
          examId,
          status: 'REVIEW',
          createdById: userId,
          remarks: `${grade}|${percentage.toFixed(2)}|${obtained}|${maxTotal}`,
        },
        update: {
          status: 'REVIEW',
          updatedById: userId,
          remarks: `${grade}|${percentage.toFixed(2)}|${obtained}|${maxTotal}`,
        },
      })
    }

    void logAudit({
      userId,
      action: 'GENERATE_RESULTS',
      entity: 'Result',
      entityId: examId,
      ipAddress,
    })

    await createNotification(exam.createdById, 'Results Ready', `Results for ${exam.name} have been generated and are ready for review.`)
  },

  async publishResults(examId: string, userId: string, force: boolean, ipAddress?: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const studentsCount = await prisma.student.count({ where: { classId: exam.classId } })
    const resultsCount = await prisma.result.count({ where: { examId } })

    if (!force && resultsCount < studentsCount) {
      throw new AppError('Some students have incomplete marks. Use force publish.', 400)
    }

    await prisma.result.updateMany({ where: { examId }, data: { status: 'PUBLISHED', updatedById: userId } })

    void logAudit({
      userId,
      action: 'PUBLISH_RESULTS',
      entity: 'Result',
      entityId: examId,
      ipAddress,
      details: { force },
    })
  },

  async getStudentReport(examId: string, studentId: string) {
    const [student, exam, marks, resultRow] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, include: { class: true } }),
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.marks.findMany({ where: { examId, studentId }, include: { subject: true } }),
      prisma.result.findUnique({ where: { studentId_examId: { studentId, examId } } }),
    ])

    if (!student || !exam) {
      throw new AppError('Result not found', 404)
    }

    const rows = marks.map((row) => ({
      subject: row.subject.name,
      maxMarks: row.maxMarks,
      marks: row.marks,
      percentage: row.maxMarks > 0 ? Number(((row.marks / row.maxMarks) * 100).toFixed(2)) : 0,
      status: row.marks >= row.maxMarks * 0.4 ? 'PASS' : 'FAIL',
    }))

    const total = marks.reduce((sum, row) => sum + row.marks, 0)
    const max = marks.reduce((sum, row) => sum + row.maxMarks, 0)
    const percentage = max > 0 ? Number(((total / max) * 100).toFixed(2)) : 0
    const grade = gradeFromPercentage(percentage)

    return {
      student,
      exam,
      subjects: rows,
      summary: {
        total,
        max,
        percentage,
        grade,
        remarks: resultRow?.remarks || '-',
        result: percentage >= 40 ? 'PASS' : 'FAIL',
      },
    }
  },
}
