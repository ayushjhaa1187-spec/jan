import prisma from '../../utils/prisma';
import AppError from '../../utils/AppError';
import { CreateClassInput, UpdateClassInput } from './class.types';

const getByIdOrThrow = async (id: string, orgId: string) => {
  const classItem = await prisma.class.findFirst({
    where: { id, orgId },
    include: { _count: { select: { students: true } } },
  });

  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  return classItem;
};

export const classService = {
  async createClass(payload: CreateClassInput) {
    const existing = await prisma.class.findFirst({
      where: { name: payload.name, section: payload.section, orgId: payload.orgId },
    });

    if (existing) {
      throw new AppError('Class already exists for this name and section in this organization', 409);
    }

    return prisma.class.create({
      data: {
        name: payload.name,
        section: payload.section,
        orgId: payload.orgId
      },
      include: { _count: { select: { students: true } } },
    });
  },

  async getAllClasses(orgId: string) {
    return prisma.class.findMany({
      where: { orgId },
      include: { _count: { select: { students: true } } },
      orderBy: [{ name: 'asc' }, { section: 'asc' }],
    });
  },

  async getClassById(id: string, orgId: string) {
    return getByIdOrThrow(id, orgId);
  },

  async updateClass(id: string, orgId: string, payload: UpdateClassInput) {
    await getByIdOrThrow(id, orgId);

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

  async deleteClass(id: string, orgId: string) {
    await getByIdOrThrow(id, orgId);

    const studentCount = await prisma.student.count({ where: { classId: id } });
    if (studentCount > 0) {
      throw new AppError('Cannot delete class with enrolled students', 400);
    }

    await prisma.class.delete({ where: { id } });
  },

  async getClassStudents(id: string, orgId: string) {
    await getByIdOrThrow(id, orgId);
    return prisma.student.findMany({
      where: { classId: id },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
  },
};
