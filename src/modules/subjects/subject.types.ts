export interface CreateSubjectInput {
  name: string;
  code: string;
  maxMarks?: number;
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  maxMarks?: number;
}
