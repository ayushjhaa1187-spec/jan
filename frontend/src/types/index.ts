export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface Class {
  id: string;
  name: string;
  section: string;
  year?: number;
  _count?: { students: number };
}

export interface Student {
  id: string;
  adm_no: string;
  name: string;
  email?: string;
  phone?: string;
  classId?: string;
  class?: Class;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks?: number;
}

export interface Teacher {
  id: string;
  userId?: string;
  employeeId: string;
  qualification?: string;
  designation?: string;
  phone?: string;
  user?: { id?: string; name?: string; email: string };
}

export interface TeacherSubject {
  teacherId: string;
  subjectId: string;
  classId: string;
  teacher?: Teacher;
  subject?: Subject;
  class?: Class;
}

export type ExamStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';

export interface Exam {
  id: string;
  name: string;
  classId: string;
  class?: Class;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  creator?: { id: string; name?: string; email?: string };
  approver?: { id: string; name?: string; email?: string } | null;
  publisher?: { id: string; name?: string; email?: string } | null;
  _count?: { marks: number; results: number };
}

export interface MarksEntry {
  id?: string;
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks: number;
  remarks?: string;
}

export interface ResultSummary {
  totalStudents: number;
  passed: number;
  failed: number;
  incomplete: number;
  average: number;
  passRate: number;
}

export interface ReportCard {
  student: Student;
  exam: Exam;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    maxMarks: number;
    obtainedMarks: number;
    percentage: number;
    status: 'PASS' | 'FAIL';
  }>;
  total: number;
  maxTotal: number;
  percentage: number;
  grade: string;
  remarks: string;
  result: 'PASS' | 'FAIL';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  user?: { id?: string; name?: string; email: string } | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unread?: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unread?: number;
  };
}

export interface ChartData {
  gradeDistribution: Array<{ label: string; value: number; color?: string }>;
  subjectAverages: Array<{ label: string; value: number }>;
  passFailDistribution: Array<{ label: 'PASS' | 'FAIL' | 'INCOMPLETE'; value: number }>;
  topPerformers: Array<{ label: string; value: number }>;
  scoreDistribution: Array<{ label: string; value: number }>;
}
