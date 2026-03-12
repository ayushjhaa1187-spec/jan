import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  deleteDraftResults,
  generateResultForStudent,
  generateResultsForExam,
  getExamResults,
  getExamSummary,
  getExamTopper,
  getStudentReportCard,
  getStudentResults,
  publishResults,
} from './result.controller';

const router = Router();

router.use(authenticate);

router.post('/generate/:examId', requirePermission('generate_results'), generateResultsForExam);
router.post('/generate/:examId/:studentId', requirePermission('generate_results'), generateResultForStudent);
router.patch('/publish/:examId', requirePermission('publish_results'), publishResults);
router.delete('/:examId', requirePermission('generate_results'), deleteDraftResults);

router.get('/student/:studentId', getStudentResults);
router.get('/summary/:examId', getExamSummary);
router.get('/topper/:examId', getExamTopper);
router.get('/:examId/:studentId', getStudentReportCard);
router.get('/:examId', getExamResults);

export default router;
