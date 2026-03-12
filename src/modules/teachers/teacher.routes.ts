import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  assignClassTeacher,
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeacherClasses,
  getTeachers,
  getTeacherSubjects,
  removeClassTeacher,
  updateTeacher,
} from './teacher.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_teachers'), asyncHandler(createTeacher));
router.get('/', asyncHandler(getTeachers));
router.get('/:id', asyncHandler(getTeacherById));
router.put('/:id', requirePermission('manage_teachers'), asyncHandler(updateTeacher));
router.delete('/:id', requirePermission('manage_teachers'), asyncHandler(deleteTeacher));
router.get('/:id/subjects', asyncHandler(getTeacherSubjects));
router.get('/:id/classes', asyncHandler(getTeacherClasses));
router.put('/:id/assign-class-teacher', requirePermission('manage_teachers'), asyncHandler(assignClassTeacher));
router.delete('/:id/remove-class-teacher', requirePermission('manage_teachers'), asyncHandler(removeClassTeacher));

export default router;
