import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  bulkCreateMarks,
  bulkUpdateMarks,
  createMarks,
  deleteMarks,
  downloadTemplate,
  getMarksByExam,
  getMarksByExamSubject,
  getMarksById,
  getMarksByStudent,
  updateMarks,
  uploadMarks,
} from './marks.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('enter_marks'), asyncHandler(createMarks));
router.post('/bulk', requirePermission('enter_marks'), asyncHandler(bulkCreateMarks));
router.put('/bulk-update', requirePermission('enter_marks'), asyncHandler(bulkUpdateMarks));
router.post('/upload/:examId/:subjectId', requirePermission('enter_marks'), asyncHandler(uploadMarks));
router.get('/template/:examId/:subjectId', asyncHandler(downloadTemplate));

router.get('/exam/:examId/subject/:subjectId', asyncHandler(getMarksByExamSubject));
router.get('/exam/:examId', asyncHandler(getMarksByExam));
router.get('/student/:studentId', asyncHandler(getMarksByStudent));

router.put('/:id', requirePermission('enter_marks'), asyncHandler(updateMarks));
router.delete('/:id', requirePermission('enter_marks'), asyncHandler(deleteMarks));
router.get('/:id', asyncHandler(getMarksById));

export default router;
