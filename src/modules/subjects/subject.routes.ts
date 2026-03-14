import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from './subject.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_subjects'), asyncHandler(createSubject));
router.get('/', asyncHandler(getSubjects));
router.get('/:id', asyncHandler(getSubjectById));
router.put('/:id', requirePermission('manage_subjects'), asyncHandler(updateSubject));
router.delete('/:id', requirePermission('manage_subjects'), asyncHandler(deleteSubject));

export default router;
