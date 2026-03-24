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
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_students'), asyncHandler(createStudent));
router.get('/', asyncHandler(getStudents));
router.get('/:id', asyncHandler(getStudentById));
router.put('/:id', requirePermission('manage_students'), asyncHandler(updateStudent));
router.delete('/:id', requirePermission('manage_students'), asyncHandler(deleteStudent));
router.put('/:id/class', requirePermission('manage_students'), asyncHandler(transferStudentClass));
router.get('/:id/results', asyncHandler(getStudentResults));
router.get('/:id/marks', asyncHandler(getStudentMarks));

export default router;
