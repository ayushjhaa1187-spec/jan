import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import {
  downloadClassReport,
  downloadMarksheet,
  downloadReportCard,
  downloadReportCardsZip,
  getCharts,
} from './report.controller'
import asyncHandler from '../../utils/asyncHandler'

const router = Router()

router.use(authenticate)

router.get('/charts/:examId', asyncHandler(getCharts))
router.get('/class-report/:examId', asyncHandler(downloadClassReport))
router.get('/marksheet/:examId', asyncHandler(downloadMarksheet))
router.get('/report-card/:examId/:studentId', asyncHandler(downloadReportCard))
router.get('/report-cards-zip/:examId', asyncHandler(downloadReportCardsZip))

export default router
