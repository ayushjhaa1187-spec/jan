import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { success } from '../../utils/apiResponse';
import { marksService } from './marks.service';
import {
  bulkMarksSchema,
  bulkUpdateSchema,
  createMarksSchema,
  updateMarksSchema,
  uploadRowsSchema,
} from './marks.validation';

const getAuthContext = (req: Request): { userId: string; permissions: string[]; ipAddress?: string } => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  return {
    userId,
    permissions: req.user?.permissions ?? [],
    ipAddress: req.ip || undefined,
  };
};

export const createMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    const payload = createMarksSchema.parse(req.body);
    const data = await marksService.createMarks(payload, auth.userId, auth.permissions, auth.ipAddress);
    return res.status(201).json(success(data, 'Marks entered successfully'));
  } catch (error) {
    return next(error);
  }
};

export const updateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    const payload = updateMarksSchema.parse(req.body);
    const data = await marksService.updateMarks(
      String(req.params.id),
      payload,
      auth.userId,
      auth.permissions,
      auth.ipAddress,
    );

    return res.json(success(data, 'Marks updated successfully'));
  } catch (error) {
    return next(error);
  }
};

export const deleteMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    await marksService.deleteMarks(String(req.params.id), auth.userId, auth.permissions, auth.ipAddress);
    return res.json(success(null, 'Marks deleted successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getMarksById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getMarks(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getExamMarks(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByExamSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getExamSubjectMarks(String(req.params.examId), String(req.params.subjectId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getStudentMarks(String(req.params.studentId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const bulkCreateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    const payload = bulkMarksSchema.parse(req.body);
    const data = await marksService.bulkCreateMarks(payload, auth.userId, auth.permissions, auth.ipAddress);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const bulkUpdateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    const payload = bulkUpdateSchema.parse(req.body);
    const data = await marksService.bulkUpdateMarks(payload, auth.userId, auth.permissions, auth.ipAddress);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const uploadMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    const examId = String(req.params.examId);
    const subjectId = String(req.params.subjectId);
    const parsedRows = uploadRowsSchema.parse({ rows: req.body?.rows });
    const data = await marksService.uploadMarksRows(
      examId,
      subjectId,
      parsedRows.rows,
      auth.userId,
      auth.permissions,
      auth.ipAddress,
    );

    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.downloadTemplate(String(req.params.examId), String(req.params.subjectId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};
