import { NextFunction, Request, Response } from 'express'
import { success } from '../../utils/apiResponse'
import { resultService } from './result.service'

export const getResultsByExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.listResultsByExam(String(req.params.examId))
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
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const publishResults = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await resultService.publishResults(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}
