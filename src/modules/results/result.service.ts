import AppError from '../../utils/AppError'
import prisma from '../../utils/prisma'

const gradeFromPercent = (percentage: number): string => {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  if (percentage >= 40) return 'D'
  return 'F'
}

export const resultService = {
  async listResultsByExam(examId: string) {
    const results = await prisma.result.findMany({
      where: { examId },
      include: { student: { include: { class: true } }, exam: true },
      orderBy: { createdAt: 'asc' },
    })

    return results.map((item, index) => ({
      id: item.id,
      rank: index + 1,
      studentId: item.studentId,
      student: item.student,
      status: item.status,
      percentage: 0,
      grade: 'INCOMPLETE',
      remarks: item.remarks,
    }))
  },

  async getSummary(examId: string) {
    const [total, published, review] = await Promise.all([
      prisma.result.count({ where: { examId } }),
      prisma.result.count({ where: { examId, status: 'PUBLISHED' } }),
      prisma.result.count({ where: { examId, status: 'REVIEW' } }),
    ])

    const incomplete = total - published

    return {
      total,
      passed: Math.max(published - review, 0),
      failed: review,
      incomplete,
      averagePercentage: 0,
      passRate: total > 0 ? Number((((published - review) / total) * 100).toFixed(2)) : 0,
    }
  },

  async getStudentResult(examId: string, studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { class: true } })
    const exam = await prisma.exam.findUnique({ where: { id: examId } })

    if (!student || !exam) {
      throw new AppError('Result not found', 404)
    }

    const marks = await prisma.marks.findMany({
      where: { examId, studentId },
      include: { subject: true },
    })

    const subjects = marks.map((markItem) => ({
      subject: { name: markItem.subject.name },
      maxMarks: markItem.maxMarks,
      marks: markItem.marks,
      percentage: markItem.maxMarks > 0 ? Number(((markItem.marks / markItem.maxMarks) * 100).toFixed(2)) : 0,
      status: markItem.marks >= markItem.maxMarks * 0.35 ? 'PASS' : 'FAIL',
    }))

    const total = marks.reduce((sum, markItem) => sum + markItem.marks, 0)
    const max = marks.reduce((sum, markItem) => sum + markItem.maxMarks, 0)
    const percentage = max > 0 ? Number(((total / max) * 100).toFixed(2)) : 0

    return {
      student,
      exam,
      subjects,
      summary: {
        total,
        max,
        percentage,
        grade: gradeFromPercent(percentage),
        remarks: percentage >= 60 ? 'Good performance' : 'Needs improvement',
        result: percentage >= 35 ? 'PASS' : 'FAIL',
      },
    }
  },

  async generateResults(examId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const students = await prisma.student.findMany({ where: { classId: exam.classId } })
    const fallbackCreator = await prisma.user.findFirst({ select: { id: true } })

    await Promise.all(
      students.map((student) =>
        prisma.result.upsert({
          where: { studentId_examId: { studentId: student.id, examId } },
          update: { status: 'REVIEW' },
          create: {
            studentId: student.id,
            examId,
            status: 'REVIEW',
            createdById: fallbackCreator?.id || student.userId,
          },
        }),
      ),
    )

    return { generated: students.length }
  },

  async publishResults(examId: string) {
    const updated = await prisma.result.updateMany({ where: { examId }, data: { status: 'PUBLISHED' } })
    return { published: updated.count }
  },
}
