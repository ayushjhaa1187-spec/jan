import { Router } from 'express'
import { authenticate, requirePermission } from '../../middlewares/authMiddleware'
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
router.post('/generate/:examId', requirePermission('manage_results'), generateResults)
router.patch('/publish/:examId', requirePermission('manage_results'), publishResults)

export default router
