import prisma from '../../utils/prisma';
import AppError from '../../utils/AppError';
import { CreateSubjectInput, UpdateSubjectInput } from './subject.types';

const getByIdOrThrow = async (id: string) => {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  return subject;
};

export const subjectService = {
  async createSubject(payload: CreateSubjectInput) {
    const existing = await prisma.subject.findFirst({
      where: { OR: [{ name: payload.name }, { code: payload.code }] },
    });

    if (existing) {
      throw new AppError('Subject with this name or code already exists', 409);
    }

    return prisma.subject.create({
      data: {
        name: payload.name,
        code: payload.code,
      },
    });
  },

  async getAllSubjects() {
    return prisma.subject.findMany({ orderBy: { name: 'asc' } });
  },

  async getSubjectById(id: string) {
    return getByIdOrThrow(id);
  },

  async updateSubject(id: string, payload: UpdateSubjectInput) {
    await getByIdOrThrow(id);

    const { maxMarks: _maxMarks, ...data } = payload;

    try {
      return await prisma.subject.update({ where: { id }, data });
    } catch {
      throw new AppError('Subject update failed', 400);
    }
  },

  async deleteSubject(id: string) {
    await getByIdOrThrow(id);

    const marksCount = await prisma.marks.count({ where: { subjectId: id } });
    if (marksCount > 0) {
      throw new AppError('Cannot delete subject because marks exist', 400);
    }

    await prisma.subject.delete({ where: { id } });
  },
};
