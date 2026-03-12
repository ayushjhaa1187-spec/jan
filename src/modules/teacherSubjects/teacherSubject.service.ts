import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { CreateTeacherSubjectInput, TeacherSubjectQuery } from './teacherSubject.types';

const toAssignmentId = (teacherId: string, subjectId: string, classId: string): string =>
  `${teacherId}:${subjectId}:${classId}`;

const parseAssignmentId = (id: string): CreateTeacherSubjectInput => {
  const parts = id.split(':');
  if (parts.length !== 3) {
    throw new AppError('Invalid assignment id', 400);
  }

  return {
    teacherId: parts[0],
    subjectId: parts[1],
    classId: parts[2],
  };
};

const includeConfig = {
  teacher: {
    include: { user: { select: { id: true, email: true } } },
  },
  subject: true,
};


const withClassData = async <T extends { classId: string }>(items: T[]) => {
  const classIds = Array.from(new Set(items.map((item) => item.classId)));
  const classes = await prisma.class.findMany({ where: { id: { in: classIds } } });
  const classMap = new Map(classes.map((item) => [item.id, item]));
  return items.map((item) => ({ ...item, class: classMap.get(item.classId) || null }));
};

export const teacherSubjectService = {
  async createAssignment(payload: CreateTeacherSubjectInput) {
    const [teacher, subject, classEntity] = await Promise.all([
      prisma.teacher.findUnique({ where: { id: payload.teacherId } }),
      prisma.subject.findUnique({ where: { id: payload.subjectId } }),
      prisma.class.findUnique({ where: { id: payload.classId } }),
    ]);

    if (!teacher) throw new AppError('Teacher not found', 404);
    if (!subject) throw new AppError('Subject not found', 404);
    if (!classEntity) throw new AppError('Class not found', 404);

    const existingSameClassSubject = await prisma.teacherSubject.findFirst({
      where: {
        classId: payload.classId,
        subjectId: payload.subjectId,
        NOT: { teacherId: payload.teacherId },
      },
    });

    if (existingSameClassSubject) {
      throw new AppError('This subject in this class is already assigned to another teacher.', 409);
    }

    const existing = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId_classId: {
          teacherId: payload.teacherId,
          subjectId: payload.subjectId,
          classId: payload.classId,
        },
      },
      include: includeConfig,
    });

    if (existing) {
      throw new AppError('Teacher subject assignment already exists', 409);
    }

    const created = await prisma.teacherSubject.create({
      data: payload,
      include: includeConfig,
    });

    const [mapped] = await withClassData([created]);
    return { ...mapped, id: toAssignmentId(created.teacherId, created.subjectId, created.classId) };
  },

  async getAssignments(query: TeacherSubjectQuery) {
    const items = await prisma.teacherSubject.findMany({
      where: {
        ...(query.classId ? { classId: query.classId } : {}),
        ...(query.teacherId ? { teacherId: query.teacherId } : {}),
        ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      },
      include: includeConfig,
      orderBy: [{ classId: 'asc' }, { subjectId: 'asc' }],
    });

    const mapped = await withClassData(items);
    return mapped.map((item) => ({
      ...item,
      id: toAssignmentId(item.teacherId, item.subjectId, item.classId),
    }));
  },

  async getAssignmentById(id: string) {
    const key = parseAssignmentId(id);
    const item = await prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId_classId: key },
      include: includeConfig,
    });

    if (!item) throw new AppError('Teacher subject assignment not found', 404);

    const [mapped] = await withClassData([item]);
    return { ...mapped, id: toAssignmentId(item.teacherId, item.subjectId, item.classId) };
  },

  async deleteAssignment(id: string) {
    const key = parseAssignmentId(id);

    const existing = await prisma.teacherSubject.findUnique({
      where: { teacherId_subjectId_classId: key },
    });

    if (!existing) throw new AppError('Teacher subject assignment not found', 404);

    await prisma.teacherSubject.delete({
      where: { teacherId_subjectId_classId: key },
    });
  },

  async getAssignmentsByClass(classId: string) {
    const classExists = await prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) throw new AppError('Class not found', 404);

    return this.getAssignments({ classId });
  },

  async getAssignmentsByTeacher(teacherId: string) {
    const teacherExists = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!teacherExists) throw new AppError('Teacher not found', 404);

    return this.getAssignments({ teacherId });
  },
};
