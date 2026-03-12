import { Router } from 'express';
import { authenticate, requirePermission } from '../../middlewares/authMiddleware';
import { getAuditByEntity, getAuditById, getAuditByUser, listAuditLogs } from './audit.controller';

const router = Router();

router.use(authenticate);
router.use(requirePermission('view_audit_logs'));

router.get('/', listAuditLogs);
router.get('/user/:userId', getAuditByUser);
router.get('/entity/:entity', getAuditByEntity);
router.get('/:id', getAuditById);

export default router;
