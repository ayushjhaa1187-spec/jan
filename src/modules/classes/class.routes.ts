import { Router } from 'express';
import {
  createClass,
  deleteClass,
  getClassById,
  getClasses,
  getClassStudents,
  updateClass,
} from './class.controller';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_classes'), asyncHandler(createClass));
router.get('/', asyncHandler(getClasses));
router.get('/:id', asyncHandler(getClassById));
router.put('/:id', requirePermission('manage_classes'), asyncHandler(updateClass));
router.delete('/:id', requirePermission('manage_classes'), asyncHandler(deleteClass));
router.get('/:id/students', asyncHandler(getClassStudents));

export default router;
