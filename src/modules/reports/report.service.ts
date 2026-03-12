import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { resultService } from '../results/result.service';
import { buildClassReportDefinition, buildMarksheetDefinition, buildReportCardDefinition, TDocumentDefinitions } from './report.templates';
import { ChartDataResponse, ClassReportData, MarksheetData, ReportCardData } from './report.types';

type PdfDocStream = NodeJS.ReadableStream & {
  end: () => void;
  on: (event: string, cb: (...args: unknown[]) => void) => PdfDocStream;
};

type PdfPrinterCtor = new (fonts: Record<string, Record<string, string>>) => {
  createPdfKitDocument: (definition: TDocumentDefinitions) => PdfDocStream;
};

type ArchiverFactory = (
  format: 'zip',
  options?: { zlib?: { level: number } },
) => {
  pipe: (stream: NodeJS.WritableStream) => void;
  append: (source: Buffer, data: { name: string }) => void;
  finalize: () => Promise<void>;
  on: (event: 'error', cb: (err: Error) => void) => void;
};

const dynamicRequire = (moduleName: string): unknown => {
  const req = eval('require') as (name: string) => unknown;
  return req(moduleName);
};

const loadPdfPrinter = (): PdfPrinterCtor => {
  try {
    return dynamicRequire('pdfmake') as PdfPrinterCtor;
  } catch {
    throw new AppError('pdfmake is not installed. Please run npm install pdfmake.', 503);
  }
};

const loadArchiver = (): ArchiverFactory => {
  try {
    return dynamicRequire('archiver') as ArchiverFactory;
  } catch {
    throw new AppError('archiver is not installed. Please run npm install archiver.', 503);
  }
};

const createPdfBuffer = async (definition: TDocumentDefinitions): Promise<Buffer> => {
  const PdfPrinter = loadPdfPrinter();

  const fontBase = path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts');
  const regular = path.join(fontBase, 'Roboto-Regular.ttf');
  const bold = path.join(fontBase, 'Roboto-Medium.ttf');
  const italics = path.join(fontBase, 'Roboto-Italic.ttf');
  const boldItalics = path.join(fontBase, 'Roboto-MediumItalic.ttf');

  if (![regular, bold, italics, boldItalics].every((p) => fs.existsSync(p))) {
    throw new AppError('pdfmake fonts are unavailable. Reinstall pdfmake package.', 503);
  }

  const printer = new PdfPrinter({
    Roboto: {
      normal: regular,
      bold,
      italics,
      bolditalics: boldItalics,
    },
  });

  const doc = printer.createPdfKitDocument(definition);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (error: Error) => reject(error));
    doc.end();
  });
};

const ensureExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { class: true } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

const getStudentSubjectRows = async (examId: string, studentId: string) => {
  const marks = await prisma.marks.findMany({ where: { examId, studentId }, include: { subject: true } });

  return marks.map((mark) => ({
    subjectId: mark.subjectId,
    subjectName: mark.subject.name,
    subjectCode: mark.subject.code,
    marks: mark.marks,
    maxMarks: mark.maxMarks,
    percentage: mark.maxMarks > 0 ? Number(((mark.marks / mark.maxMarks) * 100).toFixed(2)) : 0,
    isPassed: mark.maxMarks > 0 ? (mark.marks / mark.maxMarks) * 100 >= 35 : false,
    remarks: '',
  }));
};

const buildReportCardData = async (examId: string, studentId: string): Promise<ReportCardData> => {
  const exam = await ensureExam(examId);
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { class: true } });
  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const result = await prisma.result.findUnique({ where: { studentId_examId: { studentId, examId } } });
  if (!result) {
    throw new AppError('Result record not found', 404);
  }

  if (result.status !== 'PUBLISHED') {
    throw new AppError('Report card can only be generated for PUBLISHED results.', 400);
  }

  const subjects = await getStudentSubjectRows(examId, studentId);
  const summary = resultService.calculateStudentResult(subjects);

  return {
    student: {
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
      className: student.class.name,
      section: student.class.section,
    },
    exam: {
      name: exam.name,
      startDate: exam.startDate,
      endDate: exam.endDate,
    },
    subjects,
    summary,
    generatedAt: new Date(),
  };
};

export const reportService = {
  async generateReportCardPdf(examId: string, studentId: string) {
    const data = await buildReportCardData(examId, studentId);
    const definition = buildReportCardDefinition(data);
    const buffer = await createPdfBuffer(definition);
    const safeExamName = data.exam.name.replace(/\s+/g, '_');
    return {
      filename: `ReportCard_${data.student.adm_no}_${safeExamName}.pdf`,
      buffer,
    };
  },

  async generateClassReportPdf(examId: string) {
    const exam = await ensureExam(examId);
    const publishedCount = await prisma.result.count({ where: { examId, status: 'PUBLISHED' } });
    if (publishedCount < 1) {
      throw new AppError('No published results available for this exam.', 400);
    }

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });

    const rankedStudents: ClassReportData['rankedStudents'] = [];
    const gradeDistribution: Record<string, number> = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, D: 0, E: 0 };

    for (const student of students) {
      const subjects = await getStudentSubjectRows(examId, student.id);
      const summary = resultService.calculateStudentResult(subjects);
      gradeDistribution[summary.grade] = (gradeDistribution[summary.grade] || 0) + 1;
      rankedStudents.push({
        rank: 0,
        adm_no: student.enrollmentNo,
        name: `${student.firstName} ${student.lastName}`,
        totalMarks: summary.totalMarks,
        totalMaxMarks: summary.totalMaxMarks,
        percentage: summary.percentage,
        grade: summary.grade,
        isPassed: summary.isPassed,
      });
    }

    rankedStudents.sort((a, b) => b.percentage - a.percentage);
    rankedStudents.forEach((item, i) => {
      item.rank = i + 1;
    });

    const passCount = rankedStudents.filter((row) => row.isPassed).length;
    const incompleteCount = rankedStudents.filter((row) => row.totalMaxMarks === 0).length;

    const assignments = await prisma.teacherSubject.findMany({ where: { classId: exam.classId }, include: { subject: true } });
    const subjectAverages: ClassReportData['subjectAverages'] = [];
    for (const assignment of assignments) {
      const marks = await prisma.marks.findMany({ where: { examId, subjectId: assignment.subjectId } });
      const vals = marks.map((m) => m.marks);
      subjectAverages.push({
        subject: assignment.subject.name,
        average: vals.length ? Number((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)) : 0,
        highest: vals.length ? Math.max(...vals) : 0,
        lowest: vals.length ? Math.min(...vals) : 0,
      });
    }

    const percentages = rankedStudents.map((r) => r.percentage);
    const data: ClassReportData = {
      exam: { name: exam.name, className: exam.class.name, section: exam.class.section },
      stats: {
        totalStudents: students.length,
        passed: passCount,
        failed: students.length - passCount - incompleteCount,
        incomplete: incompleteCount,
        passPercentage: students.length ? Number(((passCount / students.length) * 100).toFixed(1)) : 0,
        classAverage: percentages.length ? Number((percentages.reduce((s, v) => s + v, 0) / percentages.length).toFixed(1)) : 0,
        highest: percentages.length ? Math.max(...percentages) : 0,
        lowest: percentages.length ? Math.min(...percentages) : 0,
      },
      gradeDistribution,
      subjectAverages,
      rankedStudents,
    };

    const buffer = await createPdfBuffer(buildClassReportDefinition(data));
    return {
      filename: `ClassReport_${exam.class.name}${exam.class.section}_${exam.name.replace(/\s+/g, '_')}.pdf`,
      buffer,
    };
  },

  async generateMarksheetPdf(examId: string) {
    const exam = await ensureExam(examId);
    const students = await prisma.student.findMany({ where: { classId: exam.classId }, orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] });
    const assignments = await prisma.teacherSubject.findMany({ where: { classId: exam.classId }, include: { subject: true } });
    const subjects = assignments.map((a) => ({ name: a.subject.name, code: a.subject.code }));

    const rows: MarksheetData['rows'] = [];
    for (const student of students) {
      const marks = await prisma.marks.findMany({ where: { examId, studentId: student.id }, include: { subject: true } });
      const marksBySubject: Record<string, number> = {};
      marks.forEach((m) => {
        marksBySubject[m.subject.code] = m.marks;
      });
      const subjectRows = marks.map((m) => ({
        subjectId: m.subjectId,
        subjectName: m.subject.name,
        subjectCode: m.subject.code,
        marks: m.marks,
        maxMarks: m.maxMarks,
        percentage: m.maxMarks > 0 ? (m.marks / m.maxMarks) * 100 : 0,
        isPassed: m.maxMarks > 0 ? (m.marks / m.maxMarks) * 100 >= 35 : false,
      }));
      const summary = resultService.calculateStudentResult(subjectRows);

      rows.push({
        adm_no: student.enrollmentNo,
        name: `${student.firstName} ${student.lastName}`,
        marksBySubject,
        total: summary.totalMarks,
        maxTotal: summary.totalMaxMarks,
        percentage: summary.percentage,
        grade: summary.grade,
      });
    }

    const subjectAverages: Record<string, number> = {};
    for (const subject of subjects) {
      const values = rows.map((r) => r.marksBySubject[subject.code]).filter((v): v is number => typeof v === 'number');
      subjectAverages[subject.code] = values.length ? Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(1)) : 0;
    }

    const data: MarksheetData = {
      exam: { name: exam.name, className: exam.class.name, section: exam.class.section },
      subjects,
      rows,
      subjectAverages,
    };

    const buffer = await createPdfBuffer(buildMarksheetDefinition(data));
    return {
      filename: `Marksheet_${exam.class.name}${exam.class.section}_${exam.name.replace(/\s+/g, '_')}.pdf`,
      buffer,
    };
  },

  async getChartData(examId: string): Promise<ChartDataResponse> {
    const exam = await ensureExam(examId);
    const summary = await resultService.getExamSummary(examId);
    const toppers = (await resultService.getTopperList(examId)) as {
      exam: { name: string };
      toppers: Array<{ rank: number; student: { name: string }; percentage: number }>;
    };

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });
    const allPercentages: number[] = [];

    for (const student of students) {
      const rows = await getStudentSubjectRows(examId, student.id);
      const computed = resultService.calculateStudentResult(rows);
      if (!computed.isIncomplete) {
        allPercentages.push(computed.percentage);
      }
    }

    const ranges = ['0-35', '36-50', '51-60', '61-70', '71-80', '81-90', '91-100'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    allPercentages.forEach((p) => {
      if (p <= 35) counts[0] += 1;
      else if (p <= 50) counts[1] += 1;
      else if (p <= 60) counts[2] += 1;
      else if (p <= 70) counts[3] += 1;
      else if (p <= 80) counts[4] += 1;
      else if (p <= 90) counts[5] += 1;
      else counts[6] += 1;
    });

    return {
      examName: exam.name,
      className: `${exam.class.name}${exam.class.section}`,
      gradeDistribution: {
        labels: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E'],
        values: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E'].map((g) => summary.gradeDistribution[g] || 0),
        colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722', '#F44336'],
      },
      subjectAverages: {
        labels: summary.subjectAverages.map((s) => s.subject),
        values: summary.subjectAverages.map((s) => s.average),
      },
      passFailDistribution: {
        labels: ['Pass', 'Fail', 'Incomplete'],
        values: [summary.passed, summary.failed, summary.incomplete],
        colors: ['#4CAF50', '#F44336', '#FFC107'],
      },
      topPerformers: {
        labels: toppers.toppers.map((item) => item.student.name),
        values: toppers.toppers.map((item) => item.percentage),
      },
      scoreDistribution: { ranges, counts },
    };
  },

  async generateBulkReportCardsZip(examId: string) {
    const exam = await ensureExam(examId);
    const studentsWithPublished = await prisma.result.findMany({
      where: { examId, status: 'PUBLISHED' },
      include: { student: true },
    });

    if (studentsWithPublished.length < 1) {
      throw new AppError('No published results available for this exam.', 400);
    }

    const archiverFactory = loadArchiver();
    const archive = archiverFactory('zip', { zlib: { level: 9 } });
    const output = new PassThrough();
    const chunks: Buffer[] = [];

    output.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

    const completion = new Promise<Buffer>((resolve, reject) => {
      output.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', (err: Error) => reject(err));
    });

    archive.pipe(output);

    for (const row of studentsWithPublished) {
      const card = await this.generateReportCardPdf(examId, row.studentId);
      const safeName = `${row.student.firstName}_${row.student.lastName}`.replace(/\s+/g, '_');
      archive.append(card.buffer, { name: `ReportCard_${row.student.enrollmentNo}_${safeName}.pdf` });
    }

    await archive.finalize();
    output.end();

    const buffer = await completion;
    return {
      filename: `ReportCards_${exam.class.name}${exam.class.section}_${exam.name.replace(/\s+/g, '_')}.zip`,
      buffer,
    };
  },
};
