import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { auditService } from './audit.service';

export const listAuditSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listAuditSchema.parse(req.query);
    const result = await auditService.listAuditLogs(query);
    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    return next(error);
  }
};

export const getAuditLogById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await auditService.getAuditById(String(req.params.id));
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getAuditLogsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await auditService.getAuditByUser(String(req.params.userId), pagination.page, pagination.limit);
    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    return next(error);
  }
};

export const getAuditLogsByEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pagination = paginationSchema.parse(req.query);
    const result = await auditService.getAuditByEntity(String(req.params.entity), pagination.page, pagination.limit);
    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    return next(error);
  }
};
