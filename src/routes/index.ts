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

const optionalRoute = (modulePath: string): Router => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const loaded = require(modulePath) as { default?: Router };
    return loaded.default || Router();
  } catch {
    return Router();
  }
};

const resultRoutes = optionalRoute('../modules/results/result.routes');
const reportRoutes = optionalRoute('../modules/reports/report.routes');

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
