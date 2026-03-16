import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import { teacherService } from './teacher.service';
import {
  assignClassTeacherSchema,
  createTeacherSchema,
  updateTeacherSchema,
} from './teacher.validation';

export const createTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createTeacherSchema.parse(req.body);
    const data = await teacherService.createTeacher({
      ...payload,
      orgId: req.user!.orgId
    });
    return res.status(201).json(success(data, 'Teacher created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getTeachers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherService.getTeachers({
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      orgId: req.user!.orgId
    });

    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherService.getTeacherById(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const updateTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateTeacherSchema.parse(req.body);
    const data = await teacherService.updateTeacher(String(req.params.id), payload);
    return res.json(success(data, 'Teacher updated successfully'));
  } catch (error) {
    return next(error);
  }
};

export const deleteTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await teacherService.deleteTeacher(String(req.params.id));
    return res.json(success(null, 'Teacher deleted successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherService.getTeacherSubjects(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherClasses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherService.getTeacherClasses(String(req.params.id));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const assignClassTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = assignClassTeacherSchema.parse(req.body);
    const data = await teacherService.assignClassTeacher(String(req.params.id), payload);
    return res.json(success(data, 'Class teacher assignment processed'));
  } catch (error) {
    return next(error);
  }
};

export const removeClassTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = assignClassTeacherSchema.parse(req.body);
    const data = await teacherService.removeClassTeacher(String(req.params.id), payload);
    return res.json(success(data, 'Class teacher removal processed'));
  } catch (error) {
    return next(error);
  }
};
