export interface User { id: string; name: string; email: string; role: string; permissions: string[] }
export interface Class { id: string; name: string; section: string; year: number; _count?: { students: number } }
export interface Student { id: string; adm_no: string; name: string; email?: string; phone?: string; classId: string; class?: Class }
export interface Subject { id: string; name: string; code: string; maxMarks: number }
export interface Teacher { id: string; employeeId: string; qualification?: string; designation?: string; phone?: string; user: { name: string; email: string } }
export interface Exam { id: string; name: string; classId: string; class?: Class; startDate: string; endDate: string; status: 'DRAFT'|'REVIEW'|'APPROVED'|'PUBLISHED'; creator?: { name: string }; approver?: { name: string }; publisher?: { name: string }; _count?: { marks: number; results: number } }
export interface Notification { id: string; title: string; message: string; read: boolean; createdAt: string }
export interface AuditLog { id: string; action: string; entity: string; entityId?: string; details?: Record<string, unknown>; ipAddress?: string; user: { name: string; email: string }; createdAt: string }
export interface PaginatedResponse<T> { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } }
export interface ApiResponse<T> { success: boolean; data: T; message?: string }
