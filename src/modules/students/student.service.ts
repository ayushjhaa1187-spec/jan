import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { CreateStudentInput, StudentListQuery, UpdateStudentInput } from './student.types';

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0] || 'N/A',
    lastName: parts.slice(1).join(' ') || 'N/A',
  };
};

const ensureClassExists = async (classId: string) => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }

  return classItem;
};

const getStudentOrThrow = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true, user: true },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

export const studentService = {
  async createStudent(data: CreateStudentInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId);

    const exists = await prisma.student.findUnique({ where: { enrollmentNo: data.adm_no } });
    if (exists) {
      throw new AppError('Student with this admission number already exists', 409);
    }

    const name = splitName(data.name);

    const createdUser = await prisma.user.create({
      data: {
        email: data.email ?? `${data.adm_no.toLowerCase()}@school.local`,
        password: 'not-used',
      },
    });

    const created = await prisma.student.create({
      data: {
        userId: createdUser.id,
        enrollmentNo: data.adm_no,
        firstName: name.firstName,
        lastName: name.lastName,
        classId: data.classId,
        dateOfBirth: new Date('2000-01-01T00:00:00.000Z'),
        gender: 'UNSPECIFIED',
      },
      include: { class: true, user: true },
    });

    void logAudit({
      userId,
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: created.id,
      ipAddress,
      details: { adm_no: created.enrollmentNo, name: `${created.firstName} ${created.lastName}` },
    });

    return {
      id: created.id,
      adm_no: created.enrollmentNo,
      name: `${created.firstName} ${created.lastName}`,
      email: created.user.email,
      class: created.class,
      createdAt: created.createdAt,
    };
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

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { class: true, user: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: students.map((item) => ({
        id: item.id,
        adm_no: item.enrollmentNo,
        name: `${item.firstName} ${item.lastName}`,
        email: item.user.email,
        class: item.class,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getStudent(id: string) {
    const student = await getStudentOrThrow(id);

    return {
      id: student.id,
      adm_no: student.enrollmentNo,
      name: `${student.firstName} ${student.lastName}`,
      email: student.user.email,
      class: student.class,
    };
  },

  async updateStudent(id: string, data: UpdateStudentInput, userId: string, ipAddress?: string) {
    await getStudentOrThrow(id);

    if (data.classId) {
      await ensureClassExists(data.classId);
    }

    const nextName = data.name ? splitName(data.name) : null;

    const updated = await prisma.student.update({
      where: { id },
      data: {
        ...(data.adm_no ? { enrollmentNo: data.adm_no } : {}),
        ...(data.classId ? { classId: data.classId } : {}),
        ...(nextName ? { firstName: nextName.firstName, lastName: nextName.lastName } : {}),
      },
      include: { class: true, user: true },
    });

    void logAudit({
      userId,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: updated.id,
      ipAddress,
      details: { adm_no: updated.enrollmentNo },
    });

    return {
      id: updated.id,
      adm_no: updated.enrollmentNo,
      name: `${updated.firstName} ${updated.lastName}`,
      email: updated.user.email,
      class: updated.class,
    };
  },

  async deleteStudent(id: string, userId: string, ipAddress?: string) {
    await getStudentOrThrow(id);

    const [marksCount, resultCount] = await Promise.all([
      prisma.marks.count({ where: { studentId: id } }),
      prisma.result.count({ where: { studentId: id } }),
    ]);

    if (marksCount > 0 || resultCount > 0) {
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
    await getStudentOrThrow(id);
    const classItem = await ensureClassExists(classId);

    const updated = await prisma.student.update({
      where: { id },
      data: { classId },
      include: { class: true, user: true },
    });

    void logAudit({
      userId,
      action: 'TRANSFER_STUDENT',
      entity: 'Student',
      entityId: updated.id,
      ipAddress,
      details: { classId: classItem.id, className: classItem.name, section: classItem.section },
    });

    return {
      id: updated.id,
      adm_no: updated.enrollmentNo,
      name: `${updated.firstName} ${updated.lastName}`,
      class: updated.class,
    };
  },

  async getStudentResults(studentId: string) {
    await getStudentOrThrow(studentId);

    return prisma.result.findMany({
      where: { studentId },
      include: { exam: { select: { id: true, name: true, startDate: true, endDate: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getStudentMarks(studentId: string) {
    await getStudentOrThrow(studentId);

    return prisma.marks.findMany({
      where: { studentId },
      include: {
        exam: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
