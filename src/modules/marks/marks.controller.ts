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

const getAuthContext = (req: Request): { userId: string; permissions: string[] } => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  return {
    userId,
    permissions: req.user?.permissions ?? [],
  };
};

export const createMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createMarksSchema.parse(req.body);
    const auth = getAuthContext(req);
    const data = await marksService.createMarks(payload, auth.userId, auth.permissions);
    return res.status(201).json(success(data, 'Marks entered successfully'));
  } catch (error) {
    return next(error);
  }
};

export const updateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateMarksSchema.parse(req.body);
    const auth = getAuthContext(req);
    const data = await marksService.updateMarks(String(req.params.id), payload, auth.userId, auth.permissions);
    return res.json(success(data, 'Marks updated successfully'));
  } catch (error) {
    return next(error);
  }
};

export const deleteMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req);
    await marksService.deleteMarks(String(req.params.id), auth.userId, auth.permissions);
    return res.json(success(null, 'Marks deleted successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getMarksById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getMarksById(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getMarksByExam(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByExamSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getMarksByExamSubject(String(req.params.examId), String(req.params.subjectId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getMarksByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await marksService.getMarksByStudent(String(req.params.studentId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const bulkCreateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bulkMarksSchema.parse(req.body);
    const auth = getAuthContext(req);
    const data = await marksService.bulkCreateMarks(payload, auth.userId, auth.permissions);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const bulkUpdateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bulkUpdateSchema.parse(req.body);
    const auth = getAuthContext(req);
    const data = await marksService.bulkUpdateMarks(payload, auth.userId, auth.permissions);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const uploadMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = String(req.params.examId);
    const subjectId = String(req.params.subjectId);
    const auth = getAuthContext(req);

    const filename = typeof req.body?.filename === 'string' ? req.body.filename.toLowerCase() : '';
    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
      throw new AppError('Only .xlsx and .xls files are allowed', 400);
    }

    const contentSize = typeof req.body?.contentSize === 'number' ? req.body.contentSize : 0;
    if (contentSize > 2 * 1024 * 1024) {
      throw new AppError('File size exceeds 2MB', 400);
    }

    const parsedRows = uploadRowsSchema.parse({ rows: req.body?.rows });
    const data = await marksService.uploadMarksRows(
      examId,
      subjectId,
      parsedRows.rows,
      auth.userId,
      auth.permissions,
    );

    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = String(req.params.examId);
    const subjectId = String(req.params.subjectId);
    const template = await marksService.generateTemplate(examId, subjectId);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${template.filename}"`);
    return res.send(template.buffer);
  } catch (error) {
    return next(error);
  }
};
