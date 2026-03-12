import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import AppError from '../../utils/AppError'
import { success } from '../../utils/apiResponse'
import prisma from '../../utils/prisma'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [total, data] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.findMany({ where, skip, take: limit, include: { student: true, exam: true }, orderBy: { createdAt: 'desc' } }),
    ])

    return res.json(success({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } }))
  } catch (error) {
    return next(error)
  }
})

router.get('/summary/:examId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    const results = await prisma.result.findMany({ where: { examId }, include: { student: true } })
    const total = results.length
    const passed = results.filter((item) => item.status === 'PUBLISHED').length
    const failed = results.filter((item) => item.status === 'FAILED').length
    const incomplete = results.filter((item) => item.status !== 'PUBLISHED' && item.status !== 'FAILED').length

    return res.json(success({
      total,
      passed,
      failed,
      incomplete,
      averagePercentage: 0,
      passRate: total > 0 ? Number(((passed / total) * 100).toFixed(2)) : 0,
    }))
  } catch (error) {
    return next(error)
  }
})

router.get('/:examId/:studentId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    const studentId = String(req.params.studentId)

    const [student, exam, marks] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, include: { class: true } }),
      prisma.exam.findUnique({ where: { id: examId } }),
      prisma.marks.findMany({ where: { studentId, examId }, include: { subject: true } }),
    ])

    if (!student || !exam) {
      throw new AppError('Result not found', 404)
    }

    const total = marks.reduce((sum, mark) => sum + mark.marks, 0)
    const max = marks.reduce((sum, mark) => sum + mark.maxMarks, 0)
    const percentage = max > 0 ? Number(((total / max) * 100).toFixed(2)) : 0

    return res.json(success({
      student,
      exam,
      subjects: marks.map((mark) => ({
        subject: mark.subject,
        maxMarks: mark.maxMarks,
        marks: mark.marks,
        percentage: mark.maxMarks > 0 ? Number(((mark.marks / mark.maxMarks) * 100).toFixed(2)) : 0,
        status: mark.marks >= mark.maxMarks * 0.35 ? 'PASS' : 'FAIL',
      })),
      summary: {
        total,
        max,
        percentage,
        grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'D',
        remarks: percentage >= 60 ? 'Good performance' : 'Needs improvement',
        result: percentage >= 35 ? 'PASS' : 'FAIL',
      },
    }))
  } catch (error) {
    return next(error)
  }
})

router.get('/:examId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    const data = await prisma.result.findMany({ where: { examId }, include: { student: true }, orderBy: { createdAt: 'asc' } })
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
})

router.post('/generate/:examId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    const students = await prisma.student.findMany({ where: { classId: (await prisma.exam.findUnique({ where: { id: examId } }))?.classId } })

    await Promise.all(students.map((student) => prisma.result.upsert({
      where: { studentId_examId: { studentId: student.id, examId } },
      create: { studentId: student.id, examId, status: 'REVIEW', createdById: req.user?.id || student.userId },
      update: { status: 'REVIEW', updatedById: req.user?.id || student.userId },
    })))

    return res.json(success(null, 'Results generated'))
  } catch (error) {
    return next(error)
  }
})

router.patch('/publish/:examId', async (req, res, next) => {
  try {
    const examId = String(req.params.examId)
    await prisma.result.updateMany({ where: { examId }, data: { status: 'PUBLISHED', updatedById: req.user?.id } })
    return res.json(success(null, 'Results published'))
  } catch (error) {
    return next(error)
  }
})

export default router
