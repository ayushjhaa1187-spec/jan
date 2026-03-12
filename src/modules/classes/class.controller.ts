import { Request, Response, NextFunction } from 'express';
import { classService } from './class.service';
import { createClassSchema, updateClassSchema } from './class.validation';
import { success } from '../../utils/apiResponse';

export const createClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createClassSchema.parse(req.body);
    const created = await classService.createClass(payload);
    return res.status(201).json(success(created, 'Class created successfully'));
  } catch (err) {
    return next(err);
  }
};

export const getClasses = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getAllClasses();
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const getClassById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getClassById(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateClassSchema.parse(req.body);
    const data = await classService.updateClass(String(req.params.id), payload);
    return res.json(success(data, 'Class updated successfully'));
  } catch (err) {
    return next(err);
  }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await classService.deleteClass(String(req.params.id));
    return res.json(success(null, 'Class deleted successfully'));
  } catch (err) {
    return next(err);
  }
};

export const getClassStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await classService.getClassStudents(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};
