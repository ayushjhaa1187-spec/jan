import prisma from '../../utils/prisma';
import AppError from '../../utils/AppError';
import { CreateSubjectInput, UpdateSubjectInput } from './subject.types';

const getByIdOrThrow = async (id: string, orgId: string) => {
  const subject = await prisma.subject.findFirst({ where: { id, orgId } });
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  return subject;
};

export const subjectService = {
  async createSubject(payload: CreateSubjectInput) {
    const existing = await prisma.subject.findFirst({
      where: { 
        orgId: payload.orgId,
        OR: [{ name: payload.name }, { code: payload.code }] 
      },
    });

    if (existing) {
      throw new AppError('Subject with this name or code already exists in your organization', 409);
    }

    return prisma.subject.create({
      data: {
        name: payload.name,
        code: payload.code,
        orgId: payload.orgId
      },
    });
  },

  async getAllSubjects(orgId: string) {
    return prisma.subject.findMany({ where: { orgId }, orderBy: { name: 'asc' } });
  },

  async getSubjectById(id: string, orgId: string) {
    return getByIdOrThrow(id, orgId);
  },

  async updateSubject(id: string, payload: UpdateSubjectInput, orgId: string) {
    await getByIdOrThrow(id, orgId);

    const { maxMarks: _maxMarks, ...data } = payload;

    try {
      return await prisma.subject.update({ where: { id }, data });
    } catch {
      throw new AppError('Subject update failed', 400);
    }
  },

  async deleteSubject(id: string, orgId: string) {
    await getByIdOrThrow(id, orgId);

    const marksCount = await prisma.marks.count({ where: { subjectId: id } });
    if (marksCount > 0) {
      throw new AppError('Cannot delete subject because marks exist', 400);
    }

    await prisma.subject.delete({ where: { id } });
  },
};
