export type ExamStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED'

export interface User {
  id: string; name: string; email: string; role: string; permissions: string[]
}
export interface Student {
  id: string; adm_no: string; name: string; email?: string; phone?: string
  classId: string; class?: ClassType
}
export interface ClassType {
  id: string; name: string; section: string; year: number
  _count?: { students: number }
}
export interface Subject {
  id: string; name: string; code: string; maxMarks: number
}
export interface Teacher {
  id: string; employeeId: string; qualification?: string
  designation?: string; phone?: string
  user: { name: string; email: string }
}
export interface Exam {
  id: string; name: string; classId: string; class?: ClassType
  startDate: string; endDate: string; status: ExamStatus
  creator?: { id: string; name: string }
  approver?: { name: string }; publisher?: { name: string }
  _count?: { marks: number; results: number }
}
export interface MarksEntry {
  id: string; studentId: string; examId: string; subjectId: string
  marks: number; maxMarks: number; remarks?: string
  student?: { adm_no: string; name: string }
  subject?: { name: string; code: string }
}
export interface Notification {
  id: string; title: string; message: string; read: boolean; createdAt: string
}
export interface AuditLog {
  id: string; action: string; entity: string; entityId?: string
  details?: Record<string, unknown>; ipAddress?: string
  user: { name: string; email: string }; createdAt: string
}
export interface PaginatedResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}
export interface ApiResponse<T> {
  success: boolean; data: T; message?: string
}
export interface ResultSummary {
  totalStudents: number; passed: number; failed: number
  incomplete: number; passPercentage: number; classAverage: number
  highest: number; lowest: number
  gradeDistribution: Record<string, number>
  subjectAverages: Array<{ subject: string; average: number }>
}
export interface ChartData {
  gradeDistribution: { labels: string[]; values: number[]; colors: string[] }
  subjectAverages: { labels: string[]; values: number[] }
  passFailDistribution: { labels: string[]; values: number[]; colors: string[] }
  topPerformers: { labels: string[]; values: number[] }
  scoreDistribution: { ranges: string[]; counts: number[] }
}
