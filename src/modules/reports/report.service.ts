import prisma from '../../utils/prisma'

const rangeLabel = (score: number): string => {
  if (score < 40) return '0-39'
  if (score < 50) return '40-49'
  if (score < 60) return '50-59'
  if (score < 70) return '60-69'
  if (score < 80) return '70-79'
  if (score < 90) return '80-89'
  return '90-100'
}

export const reportService = {
  async getCharts(examId: string) {
    const marks = await prisma.marks.findMany({ where: { examId }, include: { subject: true, student: true } })

    const byStudent = new Map<string, { name: string; total: number; max: number }>()
    const bySubject = new Map<string, { name: string; total: number; count: number }>()

    for (const mark of marks) {
      const studentKey = mark.studentId
      const currentStudent = byStudent.get(studentKey) || { name: `${mark.student.firstName} ${mark.student.lastName}`, total: 0, max: 0 }
      currentStudent.total += mark.marks
      currentStudent.max += mark.maxMarks
      byStudent.set(studentKey, currentStudent)

      const subjectKey = mark.subjectId
      const currentSubject = bySubject.get(subjectKey) || { name: mark.subject.name, total: 0, count: 0 }
      currentSubject.total += mark.marks
      currentSubject.count += 1
      bySubject.set(subjectKey, currentSubject)
    }

    const gradeDistribution = new Map<string, number>()
    const passFailDistribution = new Map<string, number>([['Pass', 0], ['Fail', 0], ['Incomplete', 0]])
    const scoreDistribution = new Map<string, number>()

    const performers = Array.from(byStudent.values()).map((item) => {
      const percentage = item.max > 0 ? (item.total / item.max) * 100 : 0
      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'D'
      gradeDistribution.set(grade, (gradeDistribution.get(grade) || 0) + 1)
      passFailDistribution.set(percentage >= 40 ? 'Pass' : 'Fail', (passFailDistribution.get(percentage >= 40 ? 'Pass' : 'Fail') || 0) + 1)
      const band = rangeLabel(percentage)
      scoreDistribution.set(band, (scoreDistribution.get(band) || 0) + 1)
      return { label: item.name, value: Number(percentage.toFixed(2)) }
    }).sort((a, b) => b.value - a.value).slice(0, 10)

    const subjectAverages = Array.from(bySubject.values()).map((item) => ({
      label: item.name,
      value: Number((item.total / (item.count || 1)).toFixed(2)),
    }))

    return {
      gradeDistribution: Array.from(gradeDistribution.entries()).map(([label, value]) => ({ label, value })),
      subjectAverages,
      passFailDistribution: Array.from(passFailDistribution.entries()).map(([label, value]) => ({ label, value })),
      topPerformers: performers,
      scoreDistribution: Array.from(scoreDistribution.entries()).map(([label, value]) => ({ label, value })),
    }
  },

  async getPdfPayload(label: string) {
    return Buffer.from(`EduTrack ${label} generated at ${new Date().toISOString()}`, 'utf-8')
  },
}
