import prisma from './prisma';

export interface AuditLogInput {
  userId?: string;
  orgId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string | Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const details = typeof input.details === 'object' 
      ? JSON.stringify(input.details) 
      : input.details;

    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        orgId: input.orgId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: details || null,
        ipAddress: input.ipAddress,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
    // swallow errors intentionally so core business flows never fail because of audit logging
  }
}
