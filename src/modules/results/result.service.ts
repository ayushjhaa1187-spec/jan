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
  async getResults(query: { status?: string; page?: number; limit?: number; orgId: string }) {
    const page = query.page && query.page > 0 ? query.page : 1
    const limit = query.limit && query.limit > 0 ? query.limit : 20
    const skip = (page - 1) * limit

    const where = {
      ...(query.status ? { status: query.status } : {}),
      orgId: query.orgId
    }

    const [total, data] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.findMany({
        where,
        include: { 
          student: { include: { class: true } }, 
          exam: true 
        },
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

  async getResultsByExam(examId: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ 
      where: { id: examId, orgId }, 
      include: { subjects: { include: { subject: true } } } 
    })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId, orgId },
      include: { class: true },
    })
    
    const marks = await prisma.marks.findMany({
      where: { 
        examId,
        orgId
      },
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

  async getSummary(examId: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ where: { id: examId, orgId } })
    if (!exam) throw new AppError('Exam not found', 404)

    const data = await this.getResultsByExam(examId, orgId)
    const counts = { PASS: 0, FAIL: 0, INCOMPLETE: 0 }
    data.forEach((r) => {
      counts[r.status]++
    })

    return {
      exam: { id: exam.id, name: exam.name },
      totalStudents: data.length,
      ...counts,
    }
  },

  async getStudentResult(examId: string, studentId: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ where: { id: examId, orgId } })
    if (!exam) throw new AppError('Exam not found', 404)

    const student = await prisma.student.findFirst({ where: { id: studentId, orgId }, include: { class: true } })
    if (!student) throw new AppError('Student not found', 404)

    const marks = await prisma.marks.findMany({
      where: { 
        examId, 
        studentId,
        orgId
      },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    })

    const subjects = marks.map((item) => {
      const percentage = item.maxMarks > 0 ? (item.marks / item.maxMarks) * 100 : 0
      return {
        subjectName: item.subject.name,
        marks: item.marks,
        maxMarks: item.maxMarks,
        grade: gradeFromPercent(percentage),
        status: percentage >= 35 ? 'PASS' : 'FAIL',
      }
    })

    const totalObtained = marks.reduce((sum, item) => sum + item.marks, 0)
    const totalMax = marks.reduce((sum, item) => sum + item.maxMarks, 0)
    const overallPercentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0

    return {
      exam: { id: exam.id, name: exam.name },
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        enrollmentNo: student.enrollmentNo,
        class: student.class.name,
      },
      subjects,
      summary: {
        totalObtained,
        totalMax,
        percentage: Number(overallPercentage.toFixed(2)),
        grade: gradeFromPercent(overallPercentage),
        status: determinePassFail(marks),
      },
    }
  },

  async generateResults(examId: string, userId: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ where: { id: examId, orgId } })
    if (!exam) throw new AppError('Exam not found', 404)

    // Clear existing results for this exam before regenerating
    await prisma.result.deleteMany({ where: { examId, orgId } })
    const computed = await this.getResultsByExam(examId, orgId)

    await prisma.result.createMany({
      data: computed.map((item) => ({
        studentId: item.studentId,
        examId,
        orgId,
        status: item.status,
        createdById: userId,
      })),
    })

    return { generated: computed.length }
  },

  async publishResults(examId: string, orgId: string) {
    const exam = await prisma.exam.findFirst({ where: { id: examId, orgId } })
    if (!exam) throw new AppError('Exam not found', 404)

    if (exam.status !== 'APPROVED') {
      throw new AppError('Exam must be in APPROVED status to publish results.', 400)
    }

    await prisma.$transaction([
      prisma.result.updateMany({
        where: { 
          examId,
          orgId
        },
        data: { status: 'PUBLISHED' },
      }),
      prisma.exam.update({
        where: { id: examId },
        data: { status: 'PUBLISHED' },
      }),
    ])

    return { publishedAt: new Date() }
  },
}
