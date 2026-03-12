import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudentMarks,
  getStudentResults,
  getStudents,
  transferStudentClass,
  updateStudent,
} from './student.controller';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_students'), createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', requirePermission('manage_students'), updateStudent);
router.delete('/:id', requirePermission('manage_students'), deleteStudent);
router.put('/:id/class', requirePermission('manage_students'), transferStudentClass);
router.get('/:id/results', getStudentResults);
router.get('/:id/marks', getStudentMarks);

export default router;
