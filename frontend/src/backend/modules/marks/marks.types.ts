export interface CreateMarksInput {
  studentId: string;
  examId: string;
  subjectId: string;
  marks: number;
  maxMarks?: number;
  remarks?: string;
}

export interface UpdateMarksInput {
  marks: number;
  remarks?: string;
}

export interface BulkMarksEntry {
  studentId: string;
  marks: number;
  maxMarks?: number;
  remarks?: string;
}

export interface BulkMarksInput {
  examId: string;
  subjectId: string;
  entries: BulkMarksEntry[];
}

export interface BulkUpdateItem {
  id: string;
  marks: number;
  remarks?: string;
}

export interface BulkUpdateInput {
  updates: BulkUpdateItem[];
}

export interface UploadRow {
  adm_no: string;
  marks: number;
  remarks?: string;
}

export interface BatchError {
  studentId: string;
  error: string;
}

export interface BatchSummary {
  successful: number;
  failed: number;
  errors: BatchError[];
}
