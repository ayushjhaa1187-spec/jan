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
import teacherRoutes from '../modules/teachers/teacher.routes';
import teacherSubjectRoutes from '../modules/teacherSubjects/teacherSubject.routes';

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
router.use('/teachers', teacherRoutes);
router.use('/teacher-subjects', teacherSubjectRoutes);

export default router;
