import { NextFunction, Request, Response } from 'express'
import { success } from '../../utils/apiResponse'
import { reportService } from './report.service'

export const getCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.getCharts(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const getReportCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getReportCard(String(req.params.examId), String(req.params.studentId))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="report-card-${req.params.examId}-${req.params.studentId}.pdf"`)
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
}

export const getClassReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getClassReport(String(req.params.examId))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="class-report-${req.params.examId}.pdf"`)
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
}

export const getMarksheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getMarksheet(String(req.params.examId))
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="marksheet-${req.params.examId}.pdf"`)
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
}

export const getReportCardsZip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getReportCardsZip(String(req.params.examId))
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="report-cards-${req.params.examId}.zip"`)
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
}
