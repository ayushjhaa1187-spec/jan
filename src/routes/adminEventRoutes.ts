import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware';
import { createEvent, deleteEvent, getAdminEvents, updateEvent } from '../controllers/eventController';
import {
  createAnnouncement,
  getAllEventsStats,
  getEventAttendees,
  getEventRecommendations,
  getEventStats,
  getLiveActivity,
  sendEventReminder,
} from '../controllers/dashboardController';

const router = Router();

router.post('/', authenticate, requireAdmin, createEvent);
router.get('/', authenticate, requireAdmin, getAdminEvents);
router.put('/:id', authenticate, requireAdmin, updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);
router.post('/:id/announcements', authenticate, requireAdmin, createAnnouncement);
router.get('/:id/attendees', authenticate, requireAdmin, getEventAttendees);
router.get('/:id/stats', authenticate, requireAdmin, getEventStats);
router.get('/all-stats', authenticate, requireAdmin, getAllEventsStats);
router.get('/:id/live-activity', authenticate, requireAdmin, getLiveActivity);
router.get('/:id/recommendations', authenticate, requireAdmin, getEventRecommendations);
router.post('/:id/reminders', authenticate, requireAdmin, sendEventReminder);

export default router;
