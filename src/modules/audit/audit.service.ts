import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { AuditListQuery } from './audit.types';

const parseDetails = (value: string | null): unknown => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const auditService = {
  async list(query: AuditListQuery) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.entity ? { entity: query.entity } : {}),
      ...((query.startDate || query.endDate)
        ? {
            createdAt: {
              ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
              ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data: data.map((row) => ({
        ...row,
        details: parseDetails(row.details),
      })),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getById(id: string) {
    const row = await prisma.auditLog.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!row) {
      throw new AppError('Audit log not found', 404);
    }

    return {
      ...row,
      details: parseDetails(row.details),
    };
  },

  async getByUser(userId: string, page: number, limit: number) {
    return this.list({ userId, page, limit });
  },

  async getByEntity(entity: string, page: number, limit: number) {
    return this.list({ entity, page, limit });
  },
};
