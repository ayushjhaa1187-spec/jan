import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import {
  generateResults,
  getExamResults,
  getResultSummary,
  getStudentResult,
  listResults,
  publishResults,
} from './result.controller'

const router = Router()

router.use(authenticate)

router.get('/', listResults)
router.get('/summary/:examId', getResultSummary)
router.get('/:examId/:studentId', getStudentResult)
router.get('/:examId', getExamResults)
router.post('/generate/:examId', generateResults)
router.patch('/publish/:examId', publishResults)

export default router
