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

const router = Router();

router.use(authenticate);
router.post('/', requirePermission('manage_classes'), createClass);
router.get('/', getClasses);
router.get('/:id', getClassById);
router.put('/:id', requirePermission('manage_classes'), updateClass);
router.delete('/:id', requirePermission('manage_classes'), deleteClass);
router.get('/:id/students', getClassStudents);

export default router;
