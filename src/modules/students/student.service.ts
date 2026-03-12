import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { CreateStudentInput, StudentListQuery, UpdateStudentInput } from './student.types';

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] || 'N/A', lastName: parts.slice(1).join(' ') || 'N/A' };
};

const ensureClassExists = async (classId: string): Promise<void> => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }
};

const getStudentEntity = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      user: { select: { email: true } },
    },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

export const studentService = {
  async createStudent(data: CreateStudentInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId);

    const duplicate = await prisma.student.findUnique({ where: { enrollmentNo: data.adm_no } });
    if (duplicate) {
      throw new AppError('Student with this admission number already exists', 409);
    }

    const name = splitName(data.name);
    const created = await prisma.student.create({
      data: {
        enrollmentNo: data.adm_no,
        firstName: name.firstName,
        lastName: name.lastName,
        class: { connect: { id: data.classId } },
        dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
        gender: 'UNSPECIFIED',
        user: {
          create: {
            email: data.email ?? `${data.adm_no.toLowerCase()}@school.local`,
            password: 'not-used',
          },
        },
      },
      include: {
        class: true,
        user: { select: { email: true } },
      },
    });

    void logAudit({
      userId,
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: created.id,
      details: { adm_no: created.enrollmentNo, name: `${created.firstName} ${created.lastName}` },
      ipAddress,
    });

    return created;
  },

  async getStudents(params: StudentListQuery) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(params.classId ? { classId: params.classId } : {}),
      ...(params.search
        ? {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' as const } },
              { lastName: { contains: params.search, mode: 'insensitive' as const } },
              { enrollmentNo: { contains: params.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { class: true, user: { select: { email: true } } },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getStudent(id: string) {
    return getStudentEntity(id);
  },

  async updateStudent(id: string, data: UpdateStudentInput, userId: string, ipAddress?: string) {
    await getStudentEntity(id);

    if (data.classId) {
      await ensureClassExists(data.classId);
    }

    const updateData: {
      enrollmentNo?: string;
      firstName?: string;
      lastName?: string;
      class?: { connect: { id: string } };
    } = {};

    if (data.adm_no) {
      updateData.enrollmentNo = data.adm_no;
    }

    if (data.name) {
      const parsed = splitName(data.name);
      updateData.firstName = parsed.firstName;
      updateData.lastName = parsed.lastName;
    }

    if (data.classId) {
      updateData.class = { connect: { id: data.classId } };
    }


    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { class: true, user: { select: { email: true } } },
    });

    void logAudit({
      userId,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: updated.id,
      details: { adm_no: updated.enrollmentNo },
      ipAddress,
    });

    return updated;
  },

  async deleteStudent(id: string, userId: string, ipAddress?: string) {
    await getStudentEntity(id);

    const [marksCount, resultsCount] = await Promise.all([
      prisma.marks.count({ where: { studentId: id } }),
      prisma.result.count({ where: { studentId: id } }),
    ]);

    if (marksCount > 0 || resultsCount > 0) {
      throw new AppError('Cannot delete student with existing marks or results', 400);
    }

    await prisma.student.delete({ where: { id } });

    void logAudit({
      userId,
      action: 'DELETE_STUDENT',
      entity: 'Student',
      entityId: id,
      ipAddress,
    });
  },

  async transferClass(id: string, classId: string, userId: string, ipAddress?: string) {
    await getStudentEntity(id);
    await ensureClassExists(classId);

    const transferred = await prisma.student.update({
      where: { id },
      data: { class: { connect: { id: classId } } },
      include: { class: true, user: { select: { email: true } } },
    });

    void logAudit({
      userId,
      action: 'TRANSFER_STUDENT',
      entity: 'Student',
      entityId: transferred.id,
      details: { classId },
      ipAddress,
    });

    return transferred;
  },

  async getStudentResults(studentId: string) {
    await getStudentEntity(studentId);

    return prisma.result.findMany({
      where: { studentId },
      include: { exam: { select: { id: true, name: true, status: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getStudentMarks(studentId: string) {
    await getStudentEntity(studentId);

    return prisma.marks.findMany({
      where: { studentId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        exam: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
