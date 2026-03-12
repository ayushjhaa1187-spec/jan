import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from './subject.controller';

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_subjects'), createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.put('/:id', requirePermission('manage_subjects'), updateSubject);
router.delete('/:id', requirePermission('manage_subjects'), deleteSubject);

export default router;
