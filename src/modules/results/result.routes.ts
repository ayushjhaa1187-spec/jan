import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import { generateResults, getResultsByExam, getResultsSummary, getStudentResult, publishResults } from './result.controller'

const router = Router()

router.use(authenticate)
router.get('/summary/:examId', getResultsSummary)
router.get('/:examId/:studentId', getStudentResult)
router.get('/:examId', getResultsByExam)
router.post('/generate/:examId', generateResults)
router.patch('/publish/:examId', publishResults)

export default router
