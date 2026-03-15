import AppError from '../../utils/AppError'
import prisma from '../../utils/prisma'

/**
 * Grading scale per EduTrack spec:
 * A+ (90%+), A (80-89%), B+ (70-79%), B (60-69%), C (50-59%), D (35-49%), E (below 35% = FAIL)
 */
const gradeFromPercent = (percent: number): string => {
  if (percent >= 90) return 'A+'
  if (percent >= 80) return 'A'
  if (percent >= 70) return 'B+'
  if (percent >= 60) return 'B'
  if (percent >= 50) return 'C'
  if (percent >= 35) return 'D'
  return 'E'
}

/**
 * Pass Rule: Students must score ≥ 35% in EVERY subject to pass.
 * Even if overall percentage is high, failing one subject = FAIL.
 */
const determinePassFail = (
  subjectMarks: Array<{ marks: number; maxMarks: number }>
): 'PASS' | 'FAIL' | 'INCOMPLETE' => {
  if (subjectMarks.length === 0) return 'INCOMPLETE'

  for (const entry of subjectMarks) {
    const subjectPercent = entry.maxMarks > 0 ? (entry.marks / entry.maxMarks) * 100 : 0
    if (subjectPercent < 35) return 'FAIL'
  }

  return 'PASS'
}

export const resultService = {
  async getResults(query: { status?: string; page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const where = query.status ? { status: query.status } : {}

    const [total, data] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.findMany({
        where,
        include: { student: { include: { class: true } }, exam: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ])

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    }
  },

  async getResultsByExam(examId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { marks: true } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      include: { class: true },
    })
    const marks = await prisma.marks.findMany({
      where: { examId },
      include: { subject: true },
    })

    const resultRows = students.map((student) => {
      const studentMarks = marks.filter((item) => item.studentId === student.id)
      const obtained = studentMarks.reduce((sum, item) => sum + item.marks, 0)
      const maximum = studentMarks.reduce((sum, item) => sum + item.maxMarks, 0)
      const percentage = maximum > 0 ? (obtained / maximum) * 100 : 0

      // Per-subject pass/fail check (≥ 35% in EVERY subject)
      const status = determinePassFail(studentMarks)

      return {
        studentId: student.id,
        student,
        total: Number(obtained.toFixed(2)),
        max: Number(maximum.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        grade: gradeFromPercent(percentage),
        status,
        subjectResults: studentMarks.map((m) => ({
          subjectName: m.subject.name,
          marks: m.marks,
          maxMarks: m.maxMarks,
          percentage: Number(((m.marks / m.maxMarks) * 100).toFixed(2)),
          grade: gradeFromPercent((m.marks / m.maxMarks) * 100),
          status: (m.marks / m.maxMarks) * 100 >= 35 ? 'PASS' : 'FAIL',
        })),
      }
    })

    // Rank by percentage (descending)
    const sorted = [...resultRows].sort((a, b) => b.percentage - a.percentage)
    return sorted.map((item, index) => ({ ...item, rank: index + 1 }))
  },

  async getSummary(examId: string) {
    const results = await this.getResultsByExam(examId)
    const total = results.length
    const passed = results.filter((item) => item.status === 'PASS').length
    const failed = results.filter((item) => item.status === 'FAIL').length
    const incomplete = results.filter((item) => item.status === 'INCOMPLETE').length
    const averagePercentage =
      total > 0 ? results.reduce((sum, item) => sum + item.percentage, 0) / total : 0
    const passRate = total > 0 ? (passed / total) * 100 : 0

    // Grade distribution
    const gradeDistribution: Record<string, number> = {}
    results.forEach((r) => {
      gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1
    })

    return {
      total,
      passed,
      failed,
      incomplete,
      averagePercentage: Number(averagePercentage.toFixed(2)),
      passRate: Number(passRate.toFixed(2)),
      gradeDistribution,
    }
  },

  async getStudentResult(examId: string, studentId: string) {
    const [exam, student] = await Promise.all([
      prisma.exam.findUnique({ where: { id: examId }, include: { class: true } }),
      prisma.student.findUnique({ where: { id: studentId }, include: { class: true } }),
    ])

    if (!exam || !student) {
      throw new AppError('Result not found', 404)
    }

    const marks = await prisma.marks.findMany({
      where: { examId, studentId },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    })

    const subjects = marks.map((item) => {
      const percentage = item.maxMarks > 0 ? (item.marks / item.maxMarks) * 100 : 0
      return {
        subject: { name: item.subject.name, code: item.subject.code },
        maxMarks: item.maxMarks,
        marks: item.marks,
        percentage: Number(percentage.toFixed(2)),
        grade: gradeFromPercent(percentage),
        status: percentage >= 35 ? 'PASS' as const : 'FAIL' as const,
      }
    })

    const total = subjects.reduce((sum, item) => sum + item.marks, 0)
    const max = subjects.reduce((sum, item) => sum + item.maxMarks, 0)
    const percentage = max > 0 ? (total / max) * 100 : 0

    // Overall pass/fail: must pass EVERY subject
    const result = determinePassFail(marks)

    return {
      exam,
      student,
      subjects,
      summary: {
        total: Number(total.toFixed(2)),
        max: Number(max.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        grade: gradeFromPercent(percentage),
        remarks: result === 'PASS' ? 'Congratulations! Passed all subjects.' : 'Failed in one or more subjects.',
        result,
      },
    }
  },

  async generateResults(examId: string, userId: string) {
    // Clear existing results for this exam before regenerating
    await prisma.result.deleteMany({ where: { examId } })
    const computed = await this.getResultsByExam(examId)

    await prisma.result.createMany({
      data: computed.map((item) => ({
        examId,
        studentId: item.studentId,
        status: 'DRAFT',
        remarks: `${item.grade} (${item.percentage}%) - ${item.status}`,
        createdById: userId,
      })),
      skipDuplicates: true,
    })

    return { count: computed.length }
  },

  async publishResults(examId: string) {
    const updated = await prisma.result.updateMany({
      where: { examId },
      data: { status: 'PUBLISHED' },
    })
    return { updated: updated.count }
  },
}
