import { NextFunction, Request, Response } from 'express'
import AppError from '../../utils/AppError'
import { success } from '../../utils/apiResponse'
import { resultService } from './result.service'

const getUserId = (req: Request): string => {
  const userId = req.user?.id
  if (!userId) {
    throw new AppError('Unauthorized', 401)
  }

  return userId
}

export const listResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.listResults({
      examId: typeof req.query.examId === 'string' ? req.query.examId : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    })

    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getExamResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getExamResults(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getResultsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getSummary(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const generateResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await resultService.generateResults(String(req.params.examId), getUserId(req), req.ip)
    return res.json(success(null, 'Results generated successfully'))
  } catch (error) {
    return next(error)
  }
}

export const publishResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const force = req.query.force === 'true'
    await resultService.publishResults(String(req.params.examId), getUserId(req), force, req.ip)
    return res.json(success(null, 'Results published successfully'))
  } catch (error) {
    return next(error)
  }
}

export const getStudentResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getStudentReport(String(req.params.examId), String(req.params.studentId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}
