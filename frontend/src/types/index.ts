export type ExamStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'

export interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

export interface Class {
  id: string
  name: string
  section: string
  year?: number
  _count?: { students: number }
}

export interface Student {
  id: string
  adm_no?: string
  enrollmentNo?: string
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  classId: string
  class?: Class
}

export interface Subject {
  id: string
  name: string
  code: string
  maxMarks?: number
}

export interface Teacher {
  id: string
  employeeId: string
  firstName?: string
  lastName?: string
  qualification?: string
  designation?: string
  phone?: string
  user?: { id: string; name: string; email: string }
}

export interface TeacherSubject {
  teacherId: string
  subjectId: string
  classId: string
  teacher?: Teacher
  subject?: Subject
  class?: Class
}

export interface Exam {
  id: string
  name: string
  classId: string
  class?: Class
  startDate: string
  endDate: string
  status: ExamStatus
  creator?: { id: string; email: string }
  approver?: { id: string; email: string } | null
  publisher?: { id: string; email: string } | null
  _count?: { marks: number; results: number }
}

export interface MarksEntry {
  id: string
  marks: number
  maxMarks: number
  remarks?: string | null
  student: { id: string; adm_no?: string; name: string }
}

export interface ResultSummary {
  total: number
  passed: number
  failed: number
  incomplete: number
  averagePercentage: number
  passRate: number
}

export interface ReportCard {
  student: Student
  exam: Exam
  subjects: Array<{ subject: string; maxMarks: number; marks: number; percentage: number; status: 'PASS' | 'FAIL' }>
  total: number
  totalMax: number
  percentage: number
  grade: string
  remarks: string
  result: 'PASS' | 'FAIL'
}

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  user?: { id: string; email: string }
  createdAt: string
}

export interface ChartData {
  gradeDistribution: Array<{ label: string; value: number }>
  subjectAverages: Array<{ label: string; value: number }>
  passFailDistribution: Array<{ label: string; value: number }>
  topPerformers: Array<{ label: string; value: number }>
  scoreDistribution: Array<{ label: string; value: number }>
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
