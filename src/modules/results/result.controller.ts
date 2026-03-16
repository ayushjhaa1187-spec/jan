import { NextFunction, Request, Response } from 'express'
import AppError from '../../utils/AppError'
import { success } from '../../utils/apiResponse'
import { resultService } from './result.service'

export const listResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getResults({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
      orgId: req.user!.orgId
    })

    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getExamResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getResultsByExam(String(req.params.examId), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getResultSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getSummary(String(req.params.examId), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getStudentResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getStudentResult(String(req.params.examId), String(req.params.studentId), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const generateResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const orgId = req.user?.orgId
    if (!userId || !orgId) throw new AppError('Unauthorized', 401)
    const data = await resultService.generateResults(String(req.params.examId), userId, orgId)
    return res.json(success(data, 'Results generated'))
  } catch (error) {
    return next(error)
  }
}

export const publishResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.publishResults(String(req.params.examId), req.user!.orgId)
    return res.json(success(data, 'Results published'))
  } catch (error) {
    return next(error)
  }
}
