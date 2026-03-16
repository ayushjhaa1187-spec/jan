export type ExamWorkflowStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';

export interface CreateExamInput {
  name: string;
  classId: string;
  startDate: string;
  endDate: string;
  orgId: string;
}

export interface UpdateExamInput {
  name?: string;
  startDate?: string;
  endDate?: string;
}

export interface RejectExamInput {
  reason: string;
}

export interface ExamListQuery {
  classId?: string;
  status?: ExamWorkflowStatus;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface ExamClassQuery {
  page?: number;
  limit?: number;
}
