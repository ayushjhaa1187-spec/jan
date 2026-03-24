export interface SubjectMarkEntry {
  subjectName: string;
  subjectCode: string;
  marks: number;
  maxMarks: number;
  percentage: number;
  isPassed: boolean;
  remarks?: string;
}

export interface ReportCardData {
  student: {
    adm_no: string;
    name: string;
    className: string;
    section: string;
    year?: number;
  };
  exam: {
    name: string;
    startDate: Date;
    endDate: Date;
  };
  subjects: SubjectMarkEntry[];
  summary: {
    totalMarks: number;
    totalMaxMarks: number;
    percentage: number;
    grade: string;
    remarks: string;
    isPassed: boolean;
    isIncomplete: boolean;
  };
  generatedAt: Date;
}

export interface ClassReportData {
  exam: { name: string; className: string; section: string; year?: number };
  stats: {
    totalStudents: number;
    passed: number;
    failed: number;
    incomplete: number;
    passPercentage: number;
    classAverage: number;
    highest: number;
    lowest: number;
  };
  gradeDistribution: Record<string, number>;
  subjectAverages: Array<{ subject: string; average: number; highest: number; lowest: number }>;
  rankedStudents: Array<{
    rank: number;
    adm_no: string;
    name: string;
    totalMarks: number;
    totalMaxMarks: number;
    percentage: number;
    grade: string;
    isPassed: boolean;
  }>;
}

export interface MarksheetData {
  exam: { name: string; className: string; section: string };
  subjects: Array<{ name: string; code: string }>;
  rows: Array<{
    adm_no: string;
    name: string;
    marksBySubject: Record<string, number>;
    total: number;
    maxTotal: number;
    percentage: number;
    grade: string;
  }>;
  subjectAverages: Record<string, number>;
}

export interface ChartDataResponse {
  examName: string;
  className: string;
  gradeDistribution: { labels: string[]; values: number[]; colors: string[] };
  subjectAverages: { labels: string[]; values: number[] };
  passFailDistribution: { labels: string[]; values: number[]; colors: string[] };
  topPerformers: { labels: string[]; values: number[] };
  scoreDistribution: { ranges: string[]; counts: number[] };
}
