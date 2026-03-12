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

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_teachers'), createTeacherSubject);
router.get('/', getTeacherSubjects);
router.get('/class/:classId', getTeacherSubjectsByClass);
router.get('/teacher/:teacherId', getTeacherSubjectsByTeacher);
router.get('/:id', getTeacherSubjectById);
router.delete('/:id', requirePermission('manage_teachers'), deleteTeacherSubject);

export default router;
