import prisma from '../../utils/prisma';
import AppError from '../../utils/AppError';
import { CreateClassInput, UpdateClassInput } from './class.types';

const getByIdOrThrow = async (id: string) => {
  const classItem = await prisma.class.findUnique({
    where: { id },
    include: { _count: { select: { students: true } } },
  });

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  return classItem;
};

export const classService = {
  async createClass(payload: CreateClassInput) {
    const existing = await prisma.class.findUnique({
      where: { name_section: { name: payload.name, section: payload.section } },
    });

    if (existing) {
      throw new AppError('Class already exists for this name and section', 409);
    }

    return prisma.class.create({
      data: {
        name: payload.name,
        section: payload.section,
      },
      include: { _count: { select: { students: true } } },
    });
  },

  async getAllClasses() {
    return prisma.class.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: [{ name: 'asc' }, { section: 'asc' }],
    });
  },

  async getClassById(id: string) {
    return getByIdOrThrow(id);
  },

  async updateClass(id: string, payload: UpdateClassInput) {
    await getByIdOrThrow(id);

    try {
      return await prisma.class.update({
        where: { id },
        data: payload,
        include: { _count: { select: { students: true } } },
      });
    } catch {
      throw new AppError('Class update failed', 400);
    }
  },

  async deleteClass(id: string) {
    await getByIdOrThrow(id);

    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) {
      throw new AppError('Cannot delete class with enrolled students', 400);
    }

    await prisma.class.delete({ where: { id } });
  },

  async getClassStudents(id: string) {
    await getByIdOrThrow(id);
    return prisma.student.findMany({
      where: { classId: id },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  },
};
