import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import studentRoutes from '../modules/students/student.routes';
import classRoutes from '../modules/classes/class.routes';
import subjectRoutes from '../modules/subjects/subject.routes';
import teacherRoutes from '../modules/teachers/teacher.routes';
import teacherSubjectRoutes from '../modules/teacherSubjects/teacherSubject.routes';
import examRoutes from '../modules/exams/exam.routes';
import marksRoutes from '../modules/marks/marks.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import auditRoutes from '../modules/audit/audit.routes';

const resultRoutes = Router();
resultRoutes.use((_req, res) => {
  return res.status(501).json({ success: false, error: 'Results module not available in this build', statusCode: 501 });
});

const reportRoutes = Router();
reportRoutes.use((_req, res) => {
  return res.status(501).json({ success: false, error: 'Reports module not available in this build', statusCode: 501 });
});

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/classes', classRoutes);
router.use('/subjects', subjectRoutes);
router.use('/teachers', teacherRoutes);
router.use('/teacher-subjects', teacherSubjectRoutes);
router.use('/exams', examRoutes);
router.use('/marks', marksRoutes);
router.use('/results', resultRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit', auditRoutes);

export default router;
