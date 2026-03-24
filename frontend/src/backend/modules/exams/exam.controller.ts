import { NextFunction, Request, Response } from 'express'
import AppError from '../../utils/AppError'
import { success } from '../../utils/apiResponse'
import { examService } from './exam.service'
import { createExamSchema, rejectExamSchema, updateExamSchema } from './exam.validation'

const getExamOpUserId = (req: Request): string => {
  const userId = req.user?.id
  if (!userId) {
    throw new AppError('Unauthorized', 401)
  }

  return userId
}

export const createExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createExamSchema.parse(req.body)
    const data = await examService.createExam(
      { ...payload, orgId: req.user!.orgId },
      getExamOpUserId(req),
      req.ip
    )
    return res.status(201).json(success(data, 'Exam created successfully'))
  } catch (error) {
    return next(error)
  }
}

export const getExams = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExams({
      orgId: req.user!.orgId,
      classId: typeof req.query.classId === 'string' ? req.query.classId : undefined,
      status: typeof req.query.status === 'string' ? req.query.status.toUpperCase() as 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
      endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    })
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getExamById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExam(String(req.params.id), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const updateExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateExamSchema.parse(req.body)
    const data = await examService.updateExam(String(req.params.id), payload, getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(data, 'Exam updated successfully'))
  } catch (error) {
    return next(error)
  }
}

export const deleteExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await examService.deleteExam(String(req.params.id), getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(null, 'Exam deleted successfully'))
  } catch (error) {
    return next(error)
  }
}

export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.submitReview(String(req.params.id), getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(data, 'Exam submitted for review'))
  } catch (error) {
    return next(error)
  }
}

export const approveExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.approveExam(String(req.params.id), getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(data, 'Exam approved successfully'))
  } catch (error) {
    return next(error)
  }
}

export const rejectExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = rejectExamSchema.parse(req.body)
    const data = await examService.rejectExam(String(req.params.id), payload.reason, getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(data, 'Exam rejected and moved to draft'))
  } catch (error) {
    return next(error)
  }
}

export const publishExam = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.publishExam(String(req.params.id), getExamOpUserId(req), req.user!.orgId, req.ip)
    return res.json(success(data, 'Exam published successfully'))
  } catch (error) {
    return next(error)
  }
}

export const getMarksStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getMarksStatus(String(req.params.id), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getExamStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getExamStudents(String(req.params.id), req.user!.orgId)
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getExamsByClass = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await examService.getClassExams(String(req.params.classId), req.user!.orgId, {
      page: typeof req.query.page === 'string' ? Number(req.query.page) : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    })

    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}
