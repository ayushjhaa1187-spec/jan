import { Router } from 'express';
import {
    getPublicEvents,
    getEventDetails,
    getGlobalStats,
} from '../controllers/eventController';
import {
    registerForEvent,
    createTeam,
    getRegistrationTicket,
    getRegistrationQR,
} from '../controllers/registrationController';
import { getEventAnnouncements } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public Routes
router.get('/', getPublicEvents);
router.get('/stats/global', getGlobalStats);
router.get('/:id', getEventDetails);
router.get('/:id/announcements', getEventAnnouncements);

// Participant Routes
router.post('/:id/register', authenticate, registerForEvent);
router.get('/:id/ticket', authenticate, getRegistrationTicket);
router.get('/:id/ticket/qr', authenticate, getRegistrationQR);
router.post('/:id/teams', authenticate, createTeam);

export default router;
