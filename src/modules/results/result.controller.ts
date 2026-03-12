import { NextFunction, Request, Response } from 'express';
import AppError from '../../utils/AppError';
import { success } from '../../utils/apiResponse';
import { resultService } from './result.service';
import { publishQuerySchema } from './result.validation';

const getUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  return userId;
};

export const generateResultsForExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.generateForExam(String(req.params.examId), getUserId(req), req.ip);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const generateResultForStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.generateForStudent(
      String(req.params.examId),
      String(req.params.studentId),
      getUserId(req),
      req.ip,
    );
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const publishResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = publishQuerySchema.parse(req.query);
    const data = await resultService.publishExamResults(String(req.params.examId), getUserId(req), {
      force: query.force,
    }, req.ip);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const deleteDraftResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.deleteDraftResults(String(req.params.examId), getUserId(req), req.ip);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getExamResults(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getStudentReportCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getReportCard(String(req.params.examId), String(req.params.studentId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getStudentResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getStudentResultHistory(String(req.params.studentId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getExamSummary(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getExamTopper = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getTopperList(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};
