import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import {
  AssignClassTeacherInput,
  CreateTeacherInput,
  TeacherListQuery,
  UpdateTeacherInput,
} from './teacher.types';

const splitFromEmail = (email: string): { firstName: string; lastName: string } => {
  const local = email.split('@')[0] || 'teacher';
  const firstName = local.slice(0, 1).toUpperCase() + local.slice(1);
  return { firstName, lastName: 'Teacher' };
};

const getTeacherByIdOrThrow = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true } },
      subjects: {
        include: {
          subject: true,
          teacher: { include: { user: { select: { email: true } } } },
        },
      },
    },
  });

  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }

  return teacher;
};

export const teacherService = {
  async createTeacher(payload: CreateTeacherInput) {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const existingByUser = await prisma.teacher.findUnique({ where: { userId: payload.userId } });
    if (existingByUser) {
      throw new AppError('Teacher profile already exists for this user', 409);
    }

    const existingByEmployee = await prisma.teacher.findUnique({ where: { employeeId: payload.employeeId } });
    if (existingByEmployee) {
      throw new AppError('Teacher with this employee ID already exists', 409);
    }

    const names = splitFromEmail(user.email);

    const created = await prisma.teacher.create({
      data: {
        userId: payload.userId,
        employeeId: payload.employeeId,
        firstName: names.firstName,
        lastName: names.lastName,
        orgId: payload.orgId,
      },
      include: { user: { select: { id: true, email: true } } },
    });

    return {
      ...created,
      qualification: payload.qualification,
      designation: payload.designation,
      phone: payload.phone,
    };
  },

  async getTeachers(query: TeacherListQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where = {
      orgId: query.orgId,
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { employeeId: { contains: query.search, mode: 'insensitive' as const } },
              { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        include: { user: { select: { id: true, email: true } } },
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

  async getTeacherById(id: string) {
    const teacher = await getTeacherByIdOrThrow(id);

    const classAssignments = await prisma.teacherSubject.findMany({ where: { teacherId: id } });
    const classIds = Array.from(new Set(classAssignments.map((item) => item.classId)));
    const classes = await prisma.class.findMany({ where: { id: { in: classIds } } });

    return {
      ...teacher,
      classes,
    };
  },

  async updateTeacher(id: string, _payload: UpdateTeacherInput) {
    const teacher = await getTeacherByIdOrThrow(id);
    return teacher;
  },

  async deleteTeacher(id: string) {
    await getTeacherByIdOrThrow(id);

    const assignmentCount = await prisma.teacherSubject.count({ where: { teacherId: id } });
    if (assignmentCount > 0) {
      throw new AppError('Teacher has subject assignments. Remove them first.', 400);
    }

    await prisma.teacher.delete({ where: { id } });
  },

  async getTeacherSubjects(id: string) {
    await getTeacherByIdOrThrow(id);
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId: id },
      include: { subject: true },
    });
    const classIds = Array.from(new Set(assignments.map((item) => item.classId)));
    const classes = await prisma.class.findMany({ where: { id: { in: classIds } } });
    const classMap = new Map(classes.map((item) => [item.id, item]));
    return assignments.map((item) => ({ ...item, class: classMap.get(item.classId) || null }));
  },

  async getTeacherClasses(id: string) {
    await getTeacherByIdOrThrow(id);

    const assignments = await prisma.teacherSubject.findMany({ where: { teacherId: id } });
    const classIds = Array.from(new Set(assignments.map((item) => item.classId)));
    return prisma.class.findMany({ where: { id: { in: classIds } } });
  },

  async assignClassTeacher(id: string, _payload: AssignClassTeacherInput) {
    await getTeacherByIdOrThrow(id);
    return {
      warning: 'Class teacher assignment is not supported by current schema.',
    };
  },

  async removeClassTeacher(id: string, _payload: AssignClassTeacherInput) {
    await getTeacherByIdOrThrow(id);
    return {
      warning: 'Class teacher assignment is not supported by current schema.',
    };
  },
};
