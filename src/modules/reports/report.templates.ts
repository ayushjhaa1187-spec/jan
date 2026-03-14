import { ClassReportData, MarksheetData, ReportCardData } from './report.types';

export type TDocumentDefinitions = {
  pageOrientation?: 'portrait' | 'landscape';
  content: unknown[];
  styles?: Record<string, unknown>;
  footer?: (currentPage: number, pageCount: number) => unknown;
};

const footer = (currentPage: number, pageCount: number) => ({
  text: `Page ${currentPage} of ${pageCount}`,
  alignment: 'center',
  fontSize: 9,
  margin: [0, 5, 0, 0],
});

export const buildReportCardDefinition = (data: ReportCardData): TDocumentDefinitions => ({
  pageOrientation: 'portrait',
  footer,
  styles: {
    title: { fontSize: 18, bold: true },
    sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 6] },
    cell: { fontSize: 10 },
  },
  content: [
    { text: 'PM SHRI KENDRIYA VIDYALAYA', style: 'title', alignment: 'center' },
    { text: 'EXAMINATION REPORT CARD', alignment: 'center', margin: [0, 0, 0, 8] },
    { text: `Exam: ${data.exam.name}` },
    {
      text: `Student: ${data.student.name} (${data.student.adm_no}) | Class ${data.student.className}${data.student.section}`,
      margin: [0, 0, 0, 8],
    },
    {
      table: {
        headerRows: 1,
        body: [
          ['Subject', 'Max Marks', 'Marks Obtained', 'Percentage', 'Status'],
          ...data.subjects.map((s) => [
            s.subjectName,
            s.maxMarks,
            s.marks,
            `${s.percentage.toFixed(1)}%`,
            s.isPassed ? 'PASS' : 'FAIL',
          ]),
          ['TOTAL', data.summary.totalMaxMarks, data.summary.totalMarks, `${data.summary.percentage.toFixed(2)}%`, ''],
        ],
      },
      layout: 'lightHorizontalLines',
    },
    { text: 'Result Summary', style: 'sectionHeader' },
    { text: `Grade: ${data.summary.grade} | Result: ${data.summary.isPassed ? 'PASS' : 'FAIL'}` },
    { text: `Remarks: ${data.summary.remarks}` },
    { text: `Generated on: ${data.generatedAt.toISOString()}`, margin: [0, 20, 0, 0], fontSize: 9 },
  ],
});

export const buildClassReportDefinition = (data: ClassReportData): TDocumentDefinitions => ({
  pageOrientation: 'portrait',
  footer,
  content: [
    { text: 'PM SHRI KENDRIYA VIDYALAYA', fontSize: 18, bold: true, alignment: 'center' },
    { text: `Class Report - ${data.exam.name} (${data.exam.className}${data.exam.section})`, margin: [0, 0, 0, 10] },
    {
      table: {
        body: [
          ['Total Students', data.stats.totalStudents],
          ['Passed', data.stats.passed],
          ['Failed', data.stats.failed],
          ['Incomplete', data.stats.incomplete],
          ['Pass Percentage', `${data.stats.passPercentage}%`],
          ['Class Average', data.stats.classAverage],
          ['Highest', data.stats.highest],
          ['Lowest', data.stats.lowest],
        ],
      },
    },
    { text: 'Rankings', margin: [0, 10, 0, 5], fontSize: 14, bold: true },
    {
      table: {
        headerRows: 1,
        body: [
          ['Rank', 'Adm No', 'Name', 'Total', '%', 'Grade', 'Result'],
          ...data.rankedStudents.map((r) => [
            r.rank,
            r.adm_no,
            r.name,
            `${r.totalMarks}/${r.totalMaxMarks}`,
            `${r.percentage}%`,
            r.grade,
            r.isPassed ? 'PASS' : 'FAIL',
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
    },
  ],
});

export const buildMarksheetDefinition = (data: MarksheetData): TDocumentDefinitions => ({
  pageOrientation: 'landscape',
  footer,
  content: [
    { text: 'PM SHRI KENDRIYA VIDYALAYA', fontSize: 18, bold: true, alignment: 'center' },
    { text: `Marksheet - ${data.exam.name} (${data.exam.className}${data.exam.section})`, margin: [0, 0, 0, 10] },
    {
      table: {
        headerRows: 1,
        body: [
          ['Adm No', 'Name', ...data.subjects.map((s) => s.code), 'Total', '%', 'Grade'],
          ...data.rows.map((row) => [
            row.adm_no,
            row.name,
            ...data.subjects.map((s) => row.marksBySubject[s.code] ?? 0),
            `${row.total}/${row.maxTotal}`,
            `${row.percentage}%`,
            row.grade,
          ]),
        ],
      },
      layout: 'lightHorizontalLines',
    },
  ],
});
