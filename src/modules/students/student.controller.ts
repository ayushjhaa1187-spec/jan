import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import { studentService } from './student.service';
import { createStudentSchema, transferClassSchema, updateStudentSchema } from './student.validation';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createStudentSchema.parse(req.body);
    const data = await studentService.createStudent(payload);
    return res.status(201).json(success(data, 'Student created successfully'));
  } catch (err) {
    return next(err);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService.getStudents({
      classId: typeof req.query.classId === 'string' ? req.query.classId : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    });
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService.getStudentById(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateStudentSchema.parse(req.body);
    const data = await studentService.updateStudent(String(req.params.id), payload);
    return res.json(success(data, 'Student updated successfully'));
  } catch (err) {
    return next(err);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await studentService.deleteStudent(String(req.params.id));
    return res.json(success(null, 'Student deleted successfully'));
  } catch (err) {
    return next(err);
  }
};

export const transferStudentClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = transferClassSchema.parse(req.body);
    const data = await studentService.transferClass(String(req.params.id), payload);
    return res.json(success(data, 'Student transferred successfully'));
  } catch (err) {
    return next(err);
  }
};

export const getStudentResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService.getStudentResults(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};

export const getStudentMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService.getStudentMarks(String(req.params.id));
    return res.json(success(data));
  } catch (err) {
    return next(err);
  }
};
