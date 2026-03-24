import AppError from '../../utils/AppError';
import prisma from '../../utils/prisma';
import { ListAuditQuery } from './audit.types';

const parseDetails = (details: string | null): Record<string, unknown> | null => {
  if (!details) {
    return null;
  }

  try {
    const parsed = JSON.parse(details);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }

    return null;
  } catch {
    return null;
  }
};

export const auditService = {
  async listAuditLogs(query: ListAuditQuery & { orgId: string }) {
    const where = {
      orgId: query.orgId,
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

    const skip = (query.page - 1) * query.limit;

    const [total, rows] = await Promise.all([
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
      data: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entity: row.entity,
        entityId: row.entityId,
        details: parseDetails(row.details),
        ipAddress: row.ipAddress,
        user: row.user,
        createdAt: row.createdAt,
      })),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  },

  async getAuditById(id: string, orgId: string) {
    const row = await prisma.auditLog.findFirst({
      where: { id, orgId },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (!row) {
      throw new AppError('Audit log not found', 404);
    }

    return {
      id: row.id,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      details: parseDetails(row.details),
      ipAddress: row.ipAddress,
      user: row.user,
      createdAt: row.createdAt,
    };
  },

  async getAuditByUser(userId: string, orgId: string, page: number, limit: number) {
    return this.listAuditLogs({ userId, orgId, page, limit });
  },

  async getAuditByEntity(entity: string, orgId: string, page: number, limit: number) {
    return this.listAuditLogs({ entity, orgId, page, limit });
  },
};
