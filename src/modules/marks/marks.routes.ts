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

const router = Router();

router.use(authenticate);

router.post('/', requirePermission('enter_marks'), createMarks);
router.post('/bulk', requirePermission('enter_marks'), bulkCreateMarks);
router.put('/bulk-update', requirePermission('enter_marks'), bulkUpdateMarks);
router.post('/upload/:examId/:subjectId', requirePermission('enter_marks'), uploadMarks);
router.get('/template/:examId/:subjectId', downloadTemplate);

router.get('/exam/:examId/subject/:subjectId', getMarksByExamSubject);
router.get('/exam/:examId', getMarksByExam);
router.get('/student/:studentId', getMarksByStudent);

router.put('/:id', requirePermission('enter_marks'), updateMarks);
router.delete('/:id', requirePermission('enter_marks'), deleteMarks);
router.get('/:id', getMarksById);

export default router;
