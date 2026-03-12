import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import { subjectService } from './subject.service';
import { createSubjectSchema, updateSubjectSchema } from './subject.validation';

export const createSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createSubjectSchema.parse(req.body);
    const data = await subjectService.createSubject(payload);
    return res.status(201).json(success(data, 'Subject created successfully'));
  } catch (err) {
    return next(err);
  }
};

export const getSubjects = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await subjectService.getAllSubjects();
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const getSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await subjectService.getSubjectById(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const updateSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateSubjectSchema.parse(req.body);
    const data = await subjectService.updateSubject(String(req.params.id), payload);
    return res.json(success(data, 'Subject updated successfully'));
  } catch (err) {
    return next(err);
  }
};

export const deleteSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await subjectService.deleteSubject(String(req.params.id));
    return res.json(success(null, 'Subject deleted successfully'));
  } catch (err) {
    return next(err);
  }
};
