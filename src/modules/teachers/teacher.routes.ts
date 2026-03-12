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

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_teachers'), createTeacher);
router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.put('/:id', requirePermission('manage_teachers'), updateTeacher);
router.delete('/:id', requirePermission('manage_teachers'), deleteTeacher);
router.get('/:id/subjects', getTeacherSubjects);
router.get('/:id/classes', getTeacherClasses);
router.put('/:id/assign-class-teacher', requirePermission('manage_teachers'), assignClassTeacher);
router.delete('/:id/remove-class-teacher', requirePermission('manage_teachers'), removeClassTeacher);

export default router;
