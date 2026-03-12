import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { success } from '../../utils/apiResponse';
import { examService } from './exam.service';
import { createExamSchema, rejectExamSchema, updateExamSchema } from './exam.validation';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  return userId;
};

const getPermissions = (req: Request): string[] => req.user?.permissions ?? [];


const parseStatus = (value: string | undefined): 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | undefined => {
  if (!value) return undefined;
  if (value === 'DRAFT' || value === 'REVIEW' || value === 'APPROVED' || value === 'PUBLISHED') {
    return value;
  }
  return undefined;
};


export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createExamSchema.parse(req.body);
    const data = await examService.createExam(payload, getUserId(req), req.ip);
    return res.status(201).json(success(data, 'Exam created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExams({
      classId: typeof req.query.classId === 'string' ? req.query.classId : undefined,
      status: parseStatus(typeof req.query.status === 'string' ? req.query.status : undefined),
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
      endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    });
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExam(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const updateExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateExamSchema.parse(req.body);
    const data = await examService.updateExam(String(req.params.id), payload, getUserId(req), req.ip);
    return res.json(success(data, 'Exam updated successfully'));
  } catch (error) {
    return next(error);
  }
};

export const deleteExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await examService.deleteExam(String(req.params.id), getUserId(req), req.ip);
    return res.json(success(null, 'Exam deleted successfully'));
  } catch (error) {
    return next(error);
  }
};

export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.submitReview(String(req.params.id), getUserId(req), req.ip);
    return res.json(success(data, 'Exam submitted for review'));
  } catch (error) {
    return next(error);
  }
};

export const approveExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.approveExam(String(req.params.id), getUserId(req), req.ip);
    return res.json(success(data, 'Exam approved successfully'));
  } catch (error) {
    return next(error);
  }
};

export const rejectExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = rejectExamSchema.parse(req.body);
    const data = await examService.rejectExam(String(req.params.id), payload.reason, getUserId(req), req.ip);
    return res.json(success(data, 'Exam rejected successfully'));
  } catch (error) {
    return next(error);
  }
};

export const publishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.publishExam(String(req.params.id), getUserId(req), req.ip);
    return res.json(success(data, 'Exam published successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getMarksStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getMarksStatus(String(req.params.id), getPermissions(req));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExamStudents(String(req.params.id), getPermissions(req));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamsByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getClassExams(String(req.params.classId), {
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    });
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};
