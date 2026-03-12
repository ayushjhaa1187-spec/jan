import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  getAuditLogById,
  getAuditLogs,
  getAuditLogsByEntity,
  getAuditLogsByUser,
} from './audit.controller';

const router = Router();

router.use(authenticate);
router.use(requirePermission('view_audit_logs'));

router.get('/', getAuditLogs);
router.get('/user/:userId', getAuditLogsByUser);
router.get('/entity/:entity', getAuditLogsByEntity);
router.get('/:id', getAuditLogById);

export default router;
