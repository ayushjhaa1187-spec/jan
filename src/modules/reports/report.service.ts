import AppError from '../../utils/AppError'
import prisma from '../../utils/prisma'

export const reportService = {
  async getCharts(examId: string) {
    const exam = await prisma.exam.findUnique({ where: { id: examId } })
    if (!exam) {
      throw new AppError('Exam not found', 404)
    }

    const results = await prisma.result.findMany({ where: { examId } })
    const marks = await prisma.marks.findMany({ where: { examId }, include: { subject: true, student: true } })

    const gradeMap = new Map<string, number>()
    for (const resultItem of results) {
      const grade = resultItem.remarks?.split('|')[0] || 'N/A'
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1)
    }

    const subjectMap = new Map<string, { total: number; count: number }>()
    for (const mark of marks) {
      const current = subjectMap.get(mark.subject.name) || { total: 0, count: 0 }
      current.total += (mark.marks / mark.maxMarks) * 100
      current.count += 1
      subjectMap.set(mark.subject.name, current)
    }

    const studentMap = new Map<string, { name: string; total: number; max: number }>()
    for (const mark of marks) {
      const current = studentMap.get(mark.studentId) || { name: `${mark.student.firstName} ${mark.student.lastName}`, total: 0, max: 0 }
      current.total += mark.marks
      current.max += mark.maxMarks
      studentMap.set(mark.studentId, current)
    }

    const topPerformers = [...studentMap.values()]
      .map((studentItem) => ({ label: studentItem.name, value: studentItem.max > 0 ? Number(((studentItem.total / studentItem.max) * 100).toFixed(2)) : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    const passCount = results.filter((resultItem) => Number(resultItem.remarks?.split('|')[1] || 0) >= 40).length
    const failCount = results.filter((resultItem) => Number(resultItem.remarks?.split('|')[1] || 0) < 40).length

    return {
      gradeDistribution: [...gradeMap.entries()].map(([label, value]) => ({ label, value })),
      subjectAverages: [...subjectMap.entries()].map(([label, stat]) => ({ label, value: Number((stat.total / stat.count).toFixed(2)) })),
      passFailDistribution: [
        { label: 'Pass', value: passCount },
        { label: 'Fail', value: failCount },
      ],
      topPerformers,
      scoreDistribution: [
        { label: '0-40', value: results.filter((resultItem) => Number(resultItem.remarks?.split('|')[1] || 0) < 40).length },
        { label: '40-60', value: results.filter((resultItem) => {
          const percentage = Number(resultItem.remarks?.split('|')[1] || 0)
          return percentage >= 40 && percentage < 60
        }).length },
        { label: '60-80', value: results.filter((resultItem) => {
          const percentage = Number(resultItem.remarks?.split('|')[1] || 0)
          return percentage >= 60 && percentage < 80
        }).length },
        { label: '80-100', value: results.filter((resultItem) => Number(resultItem.remarks?.split('|')[1] || 0) >= 80).length },
      ],
    }
  },

  async getReportCard(examId: string, studentId: string) {
    const marks = await prisma.marks.findMany({ where: { examId, studentId }, include: { subject: true } })
    const rows = marks.map((mark) => `${mark.subject.name},${mark.marks}/${mark.maxMarks}`).join('\n')
    return Buffer.from(`REPORT CARD\n${rows}`, 'utf-8')
  },

  async getClassReport(examId: string) {
    const results = await prisma.result.findMany({ where: { examId }, include: { student: true } })
    const rows = results.map((resultItem) => `${resultItem.student.enrollmentNo},${resultItem.remarks || ''}`).join('\n')
    return Buffer.from(`CLASS REPORT\n${rows}`, 'utf-8')
  },

  async getMarksheet(examId: string) {
    const marks = await prisma.marks.findMany({ where: { examId }, include: { student: true, subject: true } })
    const rows = marks.map((mark) => `${mark.student.enrollmentNo},${mark.subject.code},${mark.marks}`).join('\n')
    return Buffer.from(`MARKSHEET\n${rows}`, 'utf-8')
  },

  async getReportCardsZip(examId: string) {
    const results = await prisma.result.findMany({ where: { examId }, include: { student: true } })
    const payload = results.map((resultItem) => `${resultItem.student.enrollmentNo}:${resultItem.remarks || ''}`).join('\n')
    return Buffer.from(`ZIP_PLACEHOLDER\n${payload}`, 'utf-8')
  },
}
