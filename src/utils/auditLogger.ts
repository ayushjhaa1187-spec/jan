import prisma from './prisma';

export interface AuditLogInput {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export const logAudit = async (input: AuditLogInput): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details ? JSON.stringify(input.details) : null,
        ipAddress: input.ipAddress,
      },
    });
  } catch {
    // never throw; audit logging must not block main operations
  }
};
