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
import asyncHandler from '../../utils/asyncHandler'

const router = Router()

router.use(authenticate)



export default router
