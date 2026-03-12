import { Router } from 'express'
import { authenticate, requirePermission } from '../../middlewares/authMiddleware'
import {
  generateResults,
  getExamResults,
  getResultsSummary,
  getStudentResult,
  listResults,
  publishResults,
} from './result.controller'

const router = Router()

router.use(authenticate)

router.get('/', listResults)
router.get('/summary/:examId', getResultsSummary)
router.get('/:examId/:studentId', getStudentResult)
router.get('/:examId', getExamResults)
router.post('/generate/:examId', requirePermission('publish_exam'), generateResults)
router.patch('/publish/:examId', requirePermission('publish_exam'), publishResults)

export default router
