import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import { teacherSubjectService } from './teacherSubject.service';
import { createTeacherSubjectSchema } from './teacherSubject.validation';

export const createTeacherSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createTeacherSubjectSchema.parse(req.body);
    const data = await teacherSubjectService.createAssignment({ ...payload, orgId: req.user!.orgId });
    return res.status(201).json(success(data, 'Teacher subject assignment created successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherSubjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherSubjectService.getAssignments({
      classId: typeof req.query.classId === 'string' ? req.query.classId : undefined,
      teacherId: typeof req.query.teacherId === 'string' ? req.query.teacherId : undefined,
      subjectId: typeof req.query.subjectId === 'string' ? req.query.subjectId : undefined,
      orgId: req.user!.orgId,
    });

    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherSubjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherSubjectService.getAssignmentById(String(req.params.id), req.user!.orgId);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const deleteTeacherSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await teacherSubjectService.deleteAssignment(String(req.params.id), req.user!.orgId);
    return res.json(success(null, 'Teacher subject assignment removed successfully'));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherSubjectsByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherSubjectService.getAssignmentsByClass(String(req.params.classId), req.user!.orgId);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const getTeacherSubjectsByTeacher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await teacherSubjectService.getAssignmentsByTeacher(String(req.params.teacherId), req.user!.orgId);
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};
