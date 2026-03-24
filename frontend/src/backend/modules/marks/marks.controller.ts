import { NextFunction, Request, Response } from 'express'
import AppError from '../../utils/AppError'
import { success } from '../../utils/apiResponse'
import { marksService } from './marks.service'
import {
  bulkMarksSchema,
  bulkUpdateSchema,
  createMarksSchema,
  updateMarksSchema,
  uploadRowsSchema,
} from './marks.validation'

const getAuthContext = (req: Request): { userId: string; orgId: string; permissions: string[] } => {
  const user = req.user
  if (!user) {
    throw new AppError('Unauthorized', 401)
  }

  return {
    userId: user.id,
    orgId: user.orgId,
    permissions: user.permissions ?? [],
  }
}

export const createMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createMarksSchema.parse(req.body)
    const auth = getAuthContext(req)
    const data = await marksService.createMarks(payload, auth.userId, auth.orgId, auth.permissions, req.ip)
    return res.status(201).json(success(data, 'Marks entered successfully'))
  } catch (error) {
    return next(error)
  }
}

export const updateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateMarksSchema.parse(req.body)
    const auth = getAuthContext(req)
    const data = await marksService.updateMarks(String(req.params.id), payload, auth.userId, auth.orgId, auth.permissions, req.ip)
    return res.json(success(data, 'Marks updated successfully'))
  } catch (error) {
    return next(error)
  }
}

export const deleteMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    await marksService.deleteMarks(String(req.params.id), auth.userId, auth.orgId, auth.permissions, req.ip)
    return res.json(success(null, 'Marks deleted successfully'))
  } catch (error) {
    return next(error)
  }
}

export const getMarksById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    const data = await marksService.getMarks(String(req.params.id), auth.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getMarksByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    const data = await marksService.getExamMarks(String(req.params.examId), auth.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getMarksByExamSubject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    const data = await marksService.getExamSubjectMarks(String(req.params.examId), String(req.params.subjectId), auth.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getMarksByStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    const data = await marksService.getStudentMarks(String(req.params.studentId), auth.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const bulkCreateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bulkMarksSchema.parse(req.body)
    const auth = getAuthContext(req)
    const data = await marksService.bulkCreateMarks(payload, auth.userId, auth.orgId, auth.permissions, req.ip)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const bulkUpdateMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = bulkUpdateSchema.parse(req.body)
    const auth = getAuthContext(req)
    const data = await marksService.bulkUpdateMarks(payload, auth.userId, auth.orgId, auth.permissions, req.ip)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const uploadMarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const examId = String(req.params.examId)
    const subjectId = String(req.params.subjectId)
    const auth = getAuthContext(req)

    const parsedRows = uploadRowsSchema.parse({ rows: req.body?.rows })
    const data = await marksService.uploadMarksRows(examId, subjectId, parsedRows.rows, auth.userId, auth.orgId, auth.permissions, req.ip)

    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const downloadTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuthContext(req)
    const data = await marksService.downloadTemplate(String(req.params.examId), String(req.params.subjectId), auth.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}
