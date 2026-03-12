import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/auditLogger';
import { createNotification } from '../notifications/notification.service';
import { GradeResult, PublishQuery, StudentComputedResult, SubjectComputedResult } from './result.types';

const calculateGrade = (percentage: number): GradeResult => {
  if (percentage >= 90) return { grade: 'A+', remarks: 'Outstanding Performance!' };
  if (percentage >= 80) return { grade: 'A', remarks: 'Excellent Performance!' };
  if (percentage >= 70) return { grade: 'B+', remarks: 'Very Good Performance!' };
  if (percentage >= 60) return { grade: 'B', remarks: 'Good Performance!' };
  if (percentage >= 50) return { grade: 'C', remarks: 'Satisfactory Performance!' };
  if (percentage >= 35) return { grade: 'D', remarks: 'Average Performance. Needs Improvement.' };
  return { grade: 'E', remarks: 'Scope for Improvement!' };
};

const calculateStudentResult = (marks: SubjectComputedResult[]): StudentComputedResult => {
  if (marks.length === 0) {
    return {
      totalMarks: 0,
      totalMaxMarks: 0,
      percentage: 0,
      grade: 'E',
      remarks: 'Scope for Improvement!',
      isPassed: false,
      isIncomplete: true,
    };
  }

  const totalMarks = marks.reduce((sum, item) => sum + item.marks, 0);
  const totalMaxMarks = marks.reduce((sum, item) => sum + item.maxMarks, 0);
  const percentage = totalMaxMarks > 0 ? Number(((totalMarks / totalMaxMarks) * 100).toFixed(2)) : 0;
  const gradeMeta = calculateGrade(percentage);
  const isPassed = marks.every((item) => item.isPassed);

  return {
    totalMarks,
    totalMaxMarks,
    percentage,
    grade: gradeMeta.grade,
    remarks: gradeMeta.remarks,
    isPassed,
    isIncomplete: false,
  };
};

const ensureExam = async (examId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { class: true } });
  if (!exam) {
    throw new AppError('Exam not found', 404);
  }

  return exam;
};

const getStudentMarksForExam = async (examId: string, studentId: string): Promise<SubjectComputedResult[]> => {
  const marks = await prisma.marks.findMany({
    where: { examId, studentId },
    include: { subject: true },
    orderBy: { subject: { name: 'asc' } },
  });

  return marks.map((mark) => {
    const percentage = mark.maxMarks > 0 ? Number(((mark.marks / mark.maxMarks) * 100).toFixed(2)) : 0;
    const isPassed = percentage >= 35;

    return {
      subjectId: mark.subjectId,
      subjectName: mark.subject.name,
      subjectCode: mark.subject.code,
      marks: mark.marks,
      maxMarks: mark.maxMarks,
      percentage,
      isPassed,
      remarks: null,
    };
  });
};

const upsertDraftResult = async (studentId: string, examId: string, userId: string): Promise<void> => {
  await prisma.result.upsert({
    where: { studentId_examId: { studentId, examId } },
    create: {
      studentId,
      examId,
      status: 'DRAFT',
      createdById: userId,
    },
    update: {
      status: 'DRAFT',
      updatedById: userId,
    },
  });
};

const buildStudentResultPayload = async (examId: string, studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  const exam = await ensureExam(examId);
  const marks = await getStudentMarksForExam(examId, studentId);
  const summary = calculateStudentResult(marks);

  const result = await prisma.result.findUnique({
    where: { studentId_examId: { studentId, examId } },
    include: {
      createdBy: { select: { id: true, email: true } },
      updatedBy: { select: { id: true, email: true } },
    },
  });

  return {
    student: {
      id: student.id,
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
      class: student.class.name,
      section: student.class.section,
    },
    exam: {
      id: exam.id,
      name: exam.name,
      startDate: exam.startDate,
      endDate: exam.endDate,
    },
    subjects: marks,
    summary,
    result: result
      ? {
          status: result.status,
          generatedAt: result.createdAt,
          publishedBy: result.updatedBy?.email || null,
        }
      : null,
  };
};

export const resultService = {
  calculateGrade,
  calculateStudentResult,

  async generateForExam(examId: string, userId: string, ipAddress?: string) {
    const exam = await ensureExam(examId);
    if (exam.status !== 'APPROVED') {
      throw new AppError('Results can only be generated for APPROVED exams.', 400);
    }

    const students = await prisma.student.findMany({
      where: { classId: exam.classId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    const results: Array<Record<string, unknown>> = [];
    let generated = 0;
    let skipped = 0;

    for (const student of students) {
      const existing = await prisma.result.findUnique({
        where: { studentId_examId: { studentId: student.id, examId } },
      });

      if (existing?.status === 'PUBLISHED') {
        skipped += 1;
        continue;
      }

      await upsertDraftResult(student.id, examId, userId);
      const marks = await getStudentMarksForExam(examId, student.id);
      const summary = calculateStudentResult(marks);

      results.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        adm_no: student.enrollmentNo,
        totalMarks: summary.totalMarks,
        totalMaxMarks: summary.totalMaxMarks,
        percentage: summary.percentage,
        grade: summary.grade,
        remarks: summary.remarks,
        isPassed: summary.isPassed,
        isIncomplete: summary.isIncomplete,
        status: 'DRAFT',
      });

      generated += 1;
    }

    void logAudit({
      userId,
      action: 'GENERATE_RESULTS',
      entity: 'Result',
      entityId: examId,
      details: { generated, skipped },
      ipAddress,
    });

    await createNotification(
      exam.createdById,
      'Results Ready',
      `Results for ${exam.name} have been generated and are ready for review.`,
    );

    return {
      examId: exam.id,
      examName: exam.name,
      generated,
      skipped,
      skippedReason: skipped > 0 ? `${skipped} student result already published` : null,
      results,
    };
  },

  async generateForStudent(examId: string, studentId: string, userId: string, ipAddress?: string) {
    const exam = await ensureExam(examId);
    if (exam.status !== 'APPROVED') {
      throw new AppError('Results can only be generated for APPROVED exams.', 400);
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.classId !== exam.classId) {
      throw new AppError('Student does not belong to the exam class', 400);
    }

    const existing = await prisma.result.findUnique({
      where: { studentId_examId: { studentId, examId } },
    });

    if (existing?.status === 'PUBLISHED') {
      throw new AppError('Published results cannot be overwritten', 400);
    }

    await upsertDraftResult(studentId, examId, userId);
    void logAudit({
      userId,
      action: 'GENERATE_RESULTS',
      entity: 'Result',
      entityId: `${examId}:${studentId}`,
      ipAddress,
    });
    return buildStudentResultPayload(examId, studentId);
  },

  async publishExamResults(examId: string, userId: string, query: PublishQuery, ipAddress?: string) {
    const exam = await ensureExam(examId);
    if (!(exam.status === 'APPROVED' || exam.status === 'PUBLISHED')) {
      throw new AppError('Results can be published only for APPROVED exams.', 400);
    }

    const students = await prisma.student.findMany({ where: { classId: exam.classId } });

    const incompletes: string[] = [];
    for (const student of students) {
      const marks = await getStudentMarksForExam(examId, student.id);
      const summary = calculateStudentResult(marks);
      if (summary.isIncomplete) {
        incompletes.push(student.id);
      }
    }

    if (!query.force && incompletes.length > 0) {
      throw new AppError(
        `${incompletes.length} students have incomplete marks. Use ?force=true to publish anyway.`,
        400,
      );
    }

    const publishRes = await prisma.result.updateMany({
      where: { examId, status: 'DRAFT' },
      data: { status: 'PUBLISHED', updatedById: userId },
    });

    await prisma.exam.update({
      where: { id: examId },
      data: { status: 'PUBLISHED', updatedById: userId },
    });

    void logAudit({
      userId,
      action: 'PUBLISH_RESULTS',
      entity: 'Result',
      entityId: examId,
      details: { published: publishRes.count, incomplete: incompletes.length },
      ipAddress,
    });

    const teacherRows = await prisma.teacherSubject.findMany({
      where: { classId: exam.classId },
      include: { teacher: true },
    });
    const teacherUserIds = Array.from(new Set(teacherRows.map((row) => row.teacher.userId)));
    await Promise.all(
      teacherUserIds.map((teacherUserId) =>
        createNotification(
          teacherUserId,
          'Results Published',
          `Results for ${exam.name} - Class ${exam.class.name}${exam.class.section} have been published.`,
        ),
      ),
    );

    return {
      examId,
      published: publishRes.count,
      incomplete: incompletes.length,
      message: 'Results published successfully',
    };
  },

  async deleteDraftResults(examId: string, userId: string, ipAddress?: string) {
    await ensureExam(examId);

    const published = await prisma.result.count({ where: { examId, status: 'PUBLISHED' } });
    if (published > 0) {
      throw new AppError('Published results cannot be deleted or overwritten', 400);
    }

    const deleted = await prisma.result.deleteMany({ where: { examId, status: 'DRAFT' } });
    void logAudit({
      userId,
      action: 'DELETE_RESULTS',
      entity: 'Result',
      entityId: examId,
      details: { deleted: deleted.count },
      ipAddress,
    });
    return { deleted: deleted.count };
  },

  async getExamResults(examId: string) {
    const exam = await ensureExam(examId);
    const students = await prisma.student.findMany({ where: { classId: exam.classId } });

    const resultItems = [] as Array<Record<string, unknown>>;

    for (const student of students) {
      const marks = await getStudentMarksForExam(examId, student.id);
      const summary = calculateStudentResult(marks);
      const row = await prisma.result.findUnique({
        where: { studentId_examId: { studentId: student.id, examId } },
      });

      resultItems.push({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        adm_no: student.enrollmentNo,
        status: row?.status || 'DRAFT',
        ...summary,
      });
    }

    return {
      exam: { id: exam.id, name: exam.name },
      results: resultItems,
    };
  },

  async getReportCard(examId: string, studentId: string) {
    return buildStudentResultPayload(examId, studentId);
  },

  async getStudentResultHistory(studentId: string) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const results = await prisma.result.findMany({
      where: { studentId },
      include: { exam: true },
      orderBy: { createdAt: 'desc' },
    });

    const history = [] as Array<Record<string, unknown>>;
    for (const result of results) {
      const marks = await getStudentMarksForExam(result.examId, studentId);
      const summary = calculateStudentResult(marks);

      history.push({
        exam: {
          id: result.exam.id,
          name: result.exam.name,
        },
        status: result.status,
        generatedAt: result.createdAt,
        ...summary,
      });
    }

    return history;
  },

  async getExamSummary(examId: string) {
    const exam = await ensureExam(examId);
    const students = await prisma.student.findMany({ where: { classId: exam.classId } });

    const computed: Array<{
      studentId: string;
      adm_no: string;
      name: string;
      summary: StudentComputedResult;
    }> = [];

    for (const student of students) {
      const marks = await getStudentMarksForExam(examId, student.id);
      computed.push({
        studentId: student.id,
        adm_no: student.enrollmentNo,
        name: `${student.firstName} ${student.lastName}`,
        summary: calculateStudentResult(marks),
      });
    }

    const appeared = computed.length;
    const passed = computed.filter((row) => row.summary.isPassed && !row.summary.isIncomplete).length;
    const failed = computed.filter((row) => !row.summary.isPassed && !row.summary.isIncomplete).length;
    const incomplete = computed.filter((row) => row.summary.isIncomplete).length;
    const classAverage =
      appeared > 0
        ? Number((computed.reduce((sum, row) => sum + row.summary.percentage, 0) / appeared).toFixed(1))
        : 0;

    const sorted = [...computed].sort((a, b) => b.summary.percentage - a.summary.percentage);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    const gradeDistribution: Record<string, number> = {
      'A+': 0,
      A: 0,
      'B+': 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };

    computed.forEach((row) => {
      gradeDistribution[row.summary.grade] = (gradeDistribution[row.summary.grade] || 0) + 1;
    });

    const assignments = await prisma.teacherSubject.findMany({
      where: { classId: exam.classId },
      include: { subject: true },
    });

    const subjectAverages = [] as Array<{ subject: string; average: number }>;
    for (const assignment of assignments) {
      const marks = await prisma.marks.findMany({ where: { examId, subjectId: assignment.subjectId } });
      const avg = marks.length > 0 ? Number((marks.reduce((s, m) => s + m.marks, 0) / marks.length).toFixed(1)) : 0;
      subjectAverages.push({ subject: assignment.subject.name, average: avg });
    }

    return {
      exam: { name: exam.name, class: `${exam.class.name}${exam.class.section}` },
      totalStudents: students.length,
      appeared,
      passed,
      failed,
      incomplete,
      passPercentage: appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0,
      classAverage,
      highest: highest
        ? { student: highest.name, adm_no: highest.adm_no, percentage: highest.summary.percentage }
        : null,
      lowest: lowest
        ? { student: lowest.name, adm_no: lowest.adm_no, percentage: lowest.summary.percentage }
        : null,
      gradeDistribution,
      subjectAverages,
    };
  },

  async getTopperList(examId: string) {
    const exam = await ensureExam(examId);
    const students = await prisma.student.findMany({ where: { classId: exam.classId } });

    const ranked = [] as Array<Record<string, unknown>>;
    for (const student of students) {
      const marks = await getStudentMarksForExam(examId, student.id);
      const summary = calculateStudentResult(marks);

      if (!summary.isIncomplete) {
        ranked.push({
          student: {
            adm_no: student.enrollmentNo,
            name: `${student.firstName} ${student.lastName}`,
          },
          totalMarks: summary.totalMarks,
          totalMaxMarks: summary.totalMaxMarks,
          percentage: summary.percentage,
          grade: summary.grade,
        });
      }
    }

    const toppers = ranked
      .sort((a, b) => Number(b.percentage) - Number(a.percentage))
      .slice(0, 10)
      .map((item, index) => ({ rank: index + 1, ...item }));

    return {
      exam: { name: exam.name },
      toppers,
    };
  },
};
