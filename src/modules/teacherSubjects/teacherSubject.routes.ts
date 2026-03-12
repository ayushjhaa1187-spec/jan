import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createTeacherSubject,
  deleteTeacherSubject,
  getTeacherSubjectById,
  getTeacherSubjects,
  getTeacherSubjectsByClass,
  getTeacherSubjectsByTeacher,
} from './teacherSubject.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_teachers'), asyncHandler(createTeacherSubject));
router.get('/', asyncHandler(getTeacherSubjects));
router.get('/class/:classId', asyncHandler(getTeacherSubjectsByClass));
router.get('/teacher/:teacherId', asyncHandler(getTeacherSubjectsByTeacher));
router.get('/:id', asyncHandler(getTeacherSubjectById));
router.delete('/:id', requirePermission('manage_teachers'), asyncHandler(deleteTeacherSubject));

export default router;
