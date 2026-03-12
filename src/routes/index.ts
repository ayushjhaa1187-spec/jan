import { Router } from 'express';
import legacyAuthRoutes from './authRoutes';
import eventRoutes from './eventRoutes';
import adminEventRoutes from './adminEventRoutes';
import teamRoutes from './teamRoutes';
import adminRegistrationRoutes from './adminRegistrationRoutes';
import aiRoutes from './aiRoutes';
import authRoutes from '../modules/auth/auth.routes';
import studentRoutes from '../modules/students/student.routes';
import classRoutes from '../modules/classes/class.routes';
import subjectRoutes from '../modules/subjects/subject.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', legacyAuthRoutes);
router.use('/events', eventRoutes);
router.use('/admin/events', adminEventRoutes);
router.use('/teams', teamRoutes);
router.use('/admin/registrations', adminRegistrationRoutes);
router.use('/ai', aiRoutes);

router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);

export default router;
