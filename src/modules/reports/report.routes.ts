import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import { success } from '../../utils/apiResponse'
import prisma from '../../utils/prisma'

const router = Router()

router.use(authenticate)

router.get('/charts/:examId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    const marks = await prisma.marks.findMany({ where: { examId }, include: { subject: true, student: true } })

    const subjectMap = new Map<string, { total: number; count: number }>()
    marks.forEach((mark) => {
      const current = subjectMap.get(mark.subject.name) || { total: 0, count: 0 }
      current.total += mark.marks
      current.count += 1
      subjectMap.set(mark.subject.name, current)
    })

    const subjectAverages = Array.from(subjectMap.entries()).map(([label, values]) => ({ label, value: values.count > 0 ? Number((values.total / values.count).toFixed(2)) : 0 }))

    return res.json(success({
      gradeDistribution: [
        { label: 'A', value: 10 },
        { label: 'B', value: 20 },
        { label: 'C', value: 15 },
        { label: 'D', value: 5 },
      ],
      subjectAverages,
      passFailDistribution: [
        { label: 'Pass', value: marks.filter((item) => item.marks >= item.maxMarks * 0.35).length },
        { label: 'Fail', value: marks.filter((item) => item.marks < item.maxMarks * 0.35).length },
        { label: 'Incomplete', value: 0 },
      ],
      topPerformers: marks
        .sort((a, b) => b.marks - a.marks)
        .slice(0, 10)
        .map((item) => ({ label: `${item.student.firstName} ${item.student.lastName}`, value: Number(((item.marks / item.maxMarks) * 100).toFixed(2)) })),
      scoreDistribution: [
        { label: '0-20', value: 0 },
        { label: '21-40', value: 0 },
        { label: '41-60', value: 0 },
        { label: '61-80', value: 0 },
        { label: '81-100', value: 0 },
      ],
    }))
  } catch (error) {
    return next(error)
  }
})

router.get('/class-report/:examId', async (_req, res) => {
  return res.send(Buffer.from('Class report PDF placeholder'))
})

router.get('/marksheet/:examId', async (_req, res) => {
  return res.send(Buffer.from('Marksheet PDF placeholder'))
})

router.get('/report-card/:examId/:studentId', async (_req, res) => {
  return res.send(Buffer.from('Report card PDF placeholder'))
})

router.get('/report-cards-zip/:examId', async (_req, res) => {
  return res.send(Buffer.from('ZIP placeholder'))
})

export default router
