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
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('create_exam'), asyncHandler(createExam));
router.get('/', asyncHandler(getExams));
router.get('/class/:classId', asyncHandler(getExamsByClass));
router.get('/:id', asyncHandler(getExamById));
router.put('/:id', requirePermission('create_exam'), asyncHandler(updateExam));
router.delete('/:id', requirePermission('create_exam'), asyncHandler(deleteExam));

router.patch('/:id/submit-review', requirePermission('create_exam'), asyncHandler(submitReview));
router.patch('/:id/approve', requirePermission('approve_exam'), asyncHandler(approveExam));
router.patch('/:id/reject', requirePermission('approve_exam'), asyncHandler(rejectExam));
router.patch('/:id/publish', requirePermission('publish_exam'), asyncHandler(publishExam));

router.get('/:id/marks-status', asyncHandler(getMarksStatus));
router.get('/:id/students', asyncHandler(getExamStudents));

export default router;
