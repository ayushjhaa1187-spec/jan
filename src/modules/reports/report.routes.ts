import { Router } from 'express'
import { authenticate } from '../../middlewares/authMiddleware'
import { downloadClassReport, downloadMarksheet, downloadReportCard, downloadReportCardsZip, getCharts } from './report.controller'

const router = Router()

router.use(authenticate)
router.get('/charts/:examId', getCharts)
router.get('/class-report/:examId', downloadClassReport)
router.get('/marksheet/:examId', downloadMarksheet)
router.get('/report-card/:examId/:studentId', downloadReportCard)
router.get('/report-cards-zip/:examId', downloadReportCardsZip)

export default router
