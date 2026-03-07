import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';
import { checkInRegistration, deleteRegistration, bulkCheckIn, bulkDelete } from '../controllers/dashboardController';

const router = Router();

// Admin Routes for registrations
router.post('/bulk-checkin', authenticate, requireAdmin, bulkCheckIn);
router.post('/bulk-delete', authenticate, requireAdmin, bulkDelete);
router.post('/:id/checkin', authenticate, requireAdmin, checkInRegistration);
router.delete('/:id', authenticate, requireAdmin, deleteRegistration);

export default router;
