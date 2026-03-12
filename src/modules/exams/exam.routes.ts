import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  approveExam,
  createExam,
  deleteExam,
  getExamById,
  getExams,
  getExamsByClass,
  getExamStudents,
  getMarksStatus,
  publishExam,
  rejectExam,
  submitReview,
  updateExam,
} from './exam.controller';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('create_exam'), createExam);
router.get('/', getExams);
router.get('/class/:classId', getExamsByClass);
router.get('/:id', getExamById);
router.put('/:id', requirePermission('create_exam'), updateExam);
router.delete('/:id', requirePermission('create_exam'), deleteExam);

router.patch('/:id/submit-review', requirePermission('create_exam'), submitReview);
router.patch('/:id/approve', requirePermission('approve_exam'), approveExam);
router.patch('/:id/reject', requirePermission('approve_exam'), rejectExam);
router.patch('/:id/publish', requirePermission('publish_exam'), publishExam);

router.get('/:id/marks-status', getMarksStatus);
router.get('/:id/students', getExamStudents);

export default router;
