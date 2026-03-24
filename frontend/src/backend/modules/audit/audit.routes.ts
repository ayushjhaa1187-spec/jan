import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import {
  getAuditLogById,
  getAuditLogs,
  getAuditLogsByEntity,
  getAuditLogsByUser,
} from './audit.controller';
import asyncHandler from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);
router.use(requirePermission('view_audit_logs'));

router.get('/', asyncHandler(getAuditLogs));
router.get('/user/:userId', asyncHandler(getAuditLogsByUser));
router.get('/entity/:entity', asyncHandler(getAuditLogsByEntity));
router.get('/:id', asyncHandler(getAuditLogById));

export default router;
