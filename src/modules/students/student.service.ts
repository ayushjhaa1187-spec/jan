import AppError from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';
import prisma from '../../utils/prisma';
import { CreateStudentInput, StudentListQuery, UpdateStudentInput } from './student.types';

const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || 'N/A',
  };
};

const ensureClassExists = async (classId: string): Promise<void> => {
  const classItem = await prisma.class.findUnique({ where: { id: classId } });
  if (!classItem) {
    throw new AppError('Class not found', 404);
  }
};

const getStudentOrThrow = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { class: true },
  });

  if (!student) {
    throw new AppError('Student not found', 404);
  }

  return student;
};

const toStudentView = (student: {
  id: string;
  enrollmentNo: string;
  firstName: string;
  lastName: string;
  classId: string;
  class?: { id: string; name: string; section: string } | null;
}) => ({
  id: student.id,
  adm_no: student.enrollmentNo,
  name: `${student.firstName} ${student.lastName}`,
  classId: student.classId,
  class: student.class || null,
});

export const studentService = {
  async createStudent(data: CreateStudentInput, userId: string, ipAddress?: string) {
    await ensureClassExists(data.classId);

    const existing = await prisma.student.findUnique({ where: { enrollmentNo: data.adm_no } });
    if (existing) {
      throw new AppError('Student with this admission number already exists', 409);
    }

    const parsedName = splitName(data.name);

    const created = await prisma.student.create({
      data: {
        enrollmentNo: data.adm_no,
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
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
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'CREATE_STUDENT',
      entity: 'Student',
      entityId: created.id,
      details: { adm_no: created.enrollmentNo, name: `${created.firstName} ${created.lastName}` },
      ipAddress,
    });

    return toStudentView(created);
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
              { enrollmentNo: { contains: query.search, mode: 'insensitive' as const } },
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        include: { class: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: rows.map(toStudentView),
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
    return toStudentView(student);
  },

  async updateStudent(id: string, data: UpdateStudentInput, userId: string, ipAddress?: string) {
    await getStudentOrThrow(id);

    const updateData: {
      enrollmentNo?: string;
      firstName?: string;
      lastName?: string;
      classId?: string;
    } = {};

    if (data.classId) {
      await ensureClassExists(data.classId);
      updateData.classId = data.classId;
    }

    if (data.adm_no) {
      updateData.enrollmentNo = data.adm_no;
    }

    if (data.name) {
      const parsedName = splitName(data.name);
      updateData.firstName = parsedName.firstName;
      updateData.lastName = parsedName.lastName;
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'UPDATE_STUDENT',
      entity: 'Student',
      entityId: updated.id,
      details: { adm_no: updated.enrollmentNo },
      ipAddress,
    });

    return toStudentView(updated);
  },

  async deleteStudent(id: string, userId: string, ipAddress?: string) {
    await getStudentOrThrow(id);

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
    await getStudentOrThrow(id);
    await ensureClassExists(classId);

    const updated = await prisma.student.update({
      where: { id },
      data: { classId },
      include: { class: true },
    });

    void logAudit({
      userId,
      action: 'TRANSFER_STUDENT',
      entity: 'Student',
      entityId: updated.id,
      details: { classId },
      ipAddress,
    });

    return toStudentView(updated);
  },

  async getStudentResults(studentId: string) {
    await getStudentOrThrow(studentId);

    return prisma.result.findMany({
      where: { studentId },
      include: { exam: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getStudentMarks(studentId: string) {
    await getStudentOrThrow(studentId);

    return prisma.marks.findMany({
      where: { studentId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        exam: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
