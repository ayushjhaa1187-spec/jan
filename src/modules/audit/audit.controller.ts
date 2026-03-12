import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { success } from '../../utils/apiResponse';
import { auditService } from './audit.service';

const listAuditSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const listAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = listAuditSchema.parse(req.query);
    const data = await auditService.list(query);
    return res.json({ success: true, data: data.data, meta: data.meta });
  } catch (error) {
    return next(error);
  }
};

export const getAuditById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await auditService.getById(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getAuditByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
    const data = await auditService.getByUser(String(req.params.userId), page, limit);
    return res.json({ success: true, data: data.data, meta: data.meta });
  } catch (error) {
    return next(error);
  }
};

export const getAuditByEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : 1;
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 50;
    const data = await auditService.getByEntity(String(req.params.entity), page, limit);
    return res.json({ success: true, data: data.data, meta: data.meta });
  } catch (error) {
    return next(error);
  }
};
