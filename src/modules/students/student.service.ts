import prisma from '../../utils/prisma';
import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import {
  CreateStudentInput,
  StudentListQuery,
  TransferClassInput,
  UpdateStudentInput,
} from './student.types';

const ensureClassExists = async (classId: string) => {
  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) {
    throw new AppError('Class not found', 404);
  }
};

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || 'N/A';
  return { firstName, lastName };
};

const getByIdOrThrow = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

export const studentService = {
  async createStudent(payload: CreateStudentInput, actor?: { userId?: string; ipAddress?: string }) {
    await ensureClassExists(payload.classId);

    const existing = await prisma.student.findUnique({
      where: { enrollmentNo: payload.adm_no },
    });

    if (existing) {
      throw new AppError('Student with this admission number already exists', 409);
    }

    const parsedName = splitName(payload.name);

    const created = await prisma.student.create({
      data: {
        enrollmentNo: payload.adm_no,
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        class: { connect: { id: payload.classId } },
        dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
        gender: 'UNSPECIFIED',
        user: {
          create: {
            email: payload.email ?? `${payload.adm_no.toLowerCase()}@school.local`,
            password: 'not-used',
          },
        },
      },
      include: { class: true },
    });

    if (actor?.userId) {
      void logAudit({
        userId: actor.userId,
        action: 'CREATE_STUDENT',
        entity: 'Student',
        entityId: created.id,
        details: { adm_no: created.enrollmentNo, name: `${created.firstName} ${created.lastName}` },
        ipAddress: actor.ipAddress,
      });
    }

    return created;
  },

  async getStudents(query: StudentListQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.classId ? { classId: query.classId } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { enrollmentNo: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { class: true },
        skip,
        take: limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getStudentById(id: string) {
    return getByIdOrThrow(id);
  },

  async updateStudent(id: string, payload: UpdateStudentInput, actor?: { userId?: string; ipAddress?: string }) {
    await getByIdOrThrow(id);

    const updates: {
      enrollmentNo?: string;
      firstName?: string;
      lastName?: string;
      classId?: string;
    } = {};

    if (payload.classId) {
      await ensureClassExists(payload.classId);
      updates.classId = payload.classId;
    }

    if (payload.adm_no) {
      updates.enrollmentNo = payload.adm_no;
    }

    if (payload.name) {
      const parsed = splitName(payload.name);
      updates.firstName = parsed.firstName;
      updates.lastName = parsed.lastName;
    }

    try {
      const updated = await prisma.student.update({
        where: { id },
        data: updates,
        include: { class: true },
      });

      if (actor?.userId) {
        void logAudit({
          userId: actor.userId,
          action: 'UPDATE_STUDENT',
          entity: 'Student',
          entityId: updated.id,
          details: { adm_no: updated.enrollmentNo },
          ipAddress: actor.ipAddress,
        });
      }

      return updated;
    } catch {
      throw new AppError('Student update failed', 400);
    }
  },

  async deleteStudent(id: string, actor?: { userId?: string; ipAddress?: string }) {
    await getByIdOrThrow(id);

    const [marksCount, resultsCount] = await Promise.all([
      prisma.marks.count({ where: { studentId: id } }),
      prisma.result.count({ where: { studentId: id } }),
    ]);

    if (marksCount > 0 || resultsCount > 0) {
      throw new AppError('Cannot delete student with existing marks or results', 400);
    }

    await prisma.student.delete({ where: { id } });

    if (actor?.userId) {
      void logAudit({
        userId: actor.userId,
        action: 'DELETE_STUDENT',
        entity: 'Student',
        entityId: id,
        ipAddress: actor.ipAddress,
      });
    }
  },

  async transferClass(id: string, payload: TransferClassInput, actor?: { userId?: string; ipAddress?: string }) {
    await getByIdOrThrow(id);
    await ensureClassExists(payload.classId);

    const updated = await prisma.student.update({
      where: { id },
      data: { classId: payload.classId },
      include: { class: true },
    });

    if (actor?.userId) {
      void logAudit({
        userId: actor.userId,
        action: 'TRANSFER_STUDENT',
        entity: 'Student',
        entityId: updated.id,
        details: { classId: payload.classId },
        ipAddress: actor.ipAddress,
      });
    }

    return updated;
  },

  async getStudentResults(id: string) {
    await getByIdOrThrow(id);
    return prisma.result.findMany({
      where: { studentId: id },
      include: { exam: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getStudentMarks(id: string) {
    await getByIdOrThrow(id);
    return prisma.marks.findMany({
      where: { studentId: id },
      include: { exam: true, subject: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};
