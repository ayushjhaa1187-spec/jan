import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes'
import studentRoutes from '../modules/students/student.routes'
import classRoutes from '../modules/classes/class.routes'
import subjectRoutes from '../modules/subjects/subject.routes'
import teacherRoutes from '../modules/teachers/teacher.routes'
import teacherSubjectRoutes from '../modules/teacherSubjects/teacherSubject.routes'
import examRoutes from '../modules/exams/exam.routes'
import marksRoutes from '../modules/marks/marks.routes'
import notificationRoutes from '../modules/notifications/notification.routes'
import auditRoutes from '../modules/audit/audit.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/students', studentRoutes)
router.use('/classes', classRoutes)
router.use('/subjects', subjectRoutes)
router.use('/teachers', teacherRoutes)
router.use('/teacher-subjects', teacherSubjectRoutes)
router.use('/exams', examRoutes)
router.use('/marks', marksRoutes)
router.use('/notifications', notificationRoutes)
router.use('/audit', auditRoutes)

export default router
