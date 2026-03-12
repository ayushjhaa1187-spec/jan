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
import asyncHandler from '../../utils/asyncHandler'

const router = Router()

router.use(authenticate)

router.get('/', asyncHandler(listResults))
router.get('/summary/:examId', asyncHandler(getResultSummary))
router.get('/:examId/:studentId', asyncHandler(getStudentResult))
router.get('/:examId', asyncHandler(getExamResults))
router.post('/generate/:examId', asyncHandler(generateResults))
router.patch('/publish/:examId', asyncHandler(publishResults))

export default router
