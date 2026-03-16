export interface CreateSubjectInput {
  name: string;
  code: string;
  maxMarks?: number;
  orgId: string;
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  maxMarks?: number;
}
