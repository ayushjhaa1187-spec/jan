import { NextFunction, Request, Response } from 'express'
import { success } from '../../utils/apiResponse'
import { resultService } from './result.service'

export const listResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getResults({
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
    const data = await resultService.getResultsByExam(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getResultSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getSummary(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getStudentResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.getStudentResult(String(req.params.examId), String(req.params.studentId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const generateResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.generateResults(String(req.params.examId))
    return res.json(success(data, 'Results generated'))
  } catch (error) {
    return next(error)
  }
}

export const publishResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.publishResults(String(req.params.examId))
    return res.json(success(data, 'Results published'))
  } catch (error) {
    return next(error)
  }
}
