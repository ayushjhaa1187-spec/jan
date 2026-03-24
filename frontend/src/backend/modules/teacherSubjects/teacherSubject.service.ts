import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { CreateTeacherSubjectInput, TeacherSubjectQuery } from './teacherSubject.types';

const toAssignmentId = (teacherId: string, subjectId: string, classId: string): string =>
  `${teacherId}:${subjectId}:${classId}`;

const parseAssignmentId = (id: string, orgId: string): CreateTeacherSubjectInput => {
  const parts = id.split(':');
  if (parts.length !== 3) {
    throw new AppError('Invalid assignment id', 400);
  }

  return {
    teacherId: parts[0],
    subjectId: parts[1],
    classId: parts[2],
    orgId,
  };
};

const includeConfig = {
  teacher: {
    include: { user: { select: { id: true, email: true } } },
  },
  subject: true,
};


const withClassData = async <T extends { classId: string; orgId: string }>(items: T[]) => {
  if (items.length === 0) return [];
  const classIds = Array.from(new Set(items.map((item) => item.classId)));
  const orgId = items[0].orgId; // Grouped by orgId usually
  const classes = await prisma.class.findMany({ where: { id: { in: classIds }, orgId } });
  const classMap = new Map(classes.map((item) => [item.id, item]));
  return items.map((item) => ({ ...item, class: classMap.get(item.classId) || null }));
};

export const teacherSubjectService = {
  async createAssignment(payload: CreateTeacherSubjectInput) {
    const [teacher, subject, classEntity] = await Promise.all([
      prisma.teacher.findFirst({ where: { id: payload.teacherId, orgId: payload.orgId } }),
      prisma.subject.findFirst({ where: { id: payload.subjectId, orgId: payload.orgId } }),
      prisma.class.findFirst({ where: { id: payload.classId, orgId: payload.orgId } }),
    ]);

    if (!teacher) throw new AppError('Teacher not found or access denied', 404);
    if (!subject) throw new AppError('Subject not found or access denied', 404);
    if (!classEntity) throw new AppError('Class not found or access denied', 404);

    const existingSameClassSubject = await prisma.teacherSubject.findFirst({
      where: {
        classId: payload.classId,
        subjectId: payload.subjectId,
        orgId: payload.orgId,
        NOT: { teacherId: payload.teacherId },
      },
    });

    if (existingSameClassSubject) {
      throw new AppError('This subject in this class is already assigned to another teacher.', 409);
    }

    const existing = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: payload.teacherId,
        subjectId: payload.subjectId,
        classId: payload.classId,
        orgId: payload.orgId
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
        orgId: query.orgId,
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

  async getAssignmentById(id: string, orgId: string) {
    const key = parseAssignmentId(id, orgId);
    const item = await prisma.teacherSubject.findFirst({
      where: { 
        teacherId: key.teacherId,
        subjectId: key.subjectId,
        classId: key.classId,
        orgId 
      },
      include: includeConfig,
    });

    if (!item) throw new AppError('Teacher subject assignment not found or access denied', 404);

    const [mapped] = await withClassData([item]);
    return { ...mapped, id: toAssignmentId(item.teacherId, item.subjectId, item.classId) };
  },

  async deleteAssignment(id: string, orgId: string) {
    const key = parseAssignmentId(id, orgId);

    const existing = await prisma.teacherSubject.findFirst({
      where: { 
        teacherId: key.teacherId,
        subjectId: key.subjectId,
        classId: key.classId,
        orgId 
      },
    });

    if (!existing) throw new AppError('Teacher subject assignment not found or access denied', 404);

    await prisma.teacherSubject.delete({
      where: { 
        teacherId_subjectId_classId: {
          teacherId: key.teacherId,
          subjectId: key.subjectId,
          classId: key.classId,
        }
      },
    });
  },

  async getAssignmentsByClass(classId: string, orgId: string) {
    const classExists = await prisma.class.findFirst({ where: { id: classId, orgId } });
    if (!classExists) throw new AppError('Class not found or access denied', 404);

    return this.getAssignments({ classId, orgId });
  },

  async getAssignmentsByTeacher(teacherId: string, orgId: string) {
    const teacherExists = await prisma.teacher.findFirst({ where: { id: teacherId, orgId } });
    if (!teacherExists) throw new AppError('Teacher not found or access denied', 404);

    return this.getAssignments({ teacherId, orgId });
  },
};
