import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  downloadBulkReportCardsZip,
  downloadClassReportPdf,
  downloadMarksheetPdf,
  downloadReportCardPdf,
  getChartsData,
} from './report.controller';

const router = Router();

router.use(authenticate);

router.get('/report-card/:examId/:studentId', downloadReportCardPdf);
router.get('/class-report/:examId', downloadClassReportPdf);
router.get('/marksheet/:examId', downloadMarksheetPdf);
router.get('/charts/:examId', getChartsData);
router.post('/bulk-report-cards/:examId', requirePermission('generate_results'), downloadBulkReportCardsZip);

export default router;
