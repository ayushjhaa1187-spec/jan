import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import { getCharts, getClassReport, getMarksheet, getReportCard, getReportCardsZip } from './report.controller'

const router = Router()

router.use(authenticate)

router.get('/charts/:examId', getCharts)
router.get('/report-card/:examId/:studentId', getReportCard)
router.get('/class-report/:examId', getClassReport)
router.get('/marksheet/:examId', getMarksheet)
router.get('/report-cards-zip/:examId', getReportCardsZip)

export default router
