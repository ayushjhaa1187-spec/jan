export interface PublishQuery {
  force?: boolean;
}

export interface GradeResult {
  grade: string;
  remarks: string;
}

export interface SubjectComputedResult {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  isPassed: boolean;
  remarks?: string | null;
}

export interface StudentComputedResult {
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  remarks: string;
  isPassed: boolean;
  isIncomplete: boolean;
}
