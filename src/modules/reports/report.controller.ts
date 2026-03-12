import { NextFunction, Request, Response } from 'express'
import { success } from '../../utils/apiResponse'
import { reportService } from './report.service'

const sendPdf = (res: Response, filename: string, buffer: Buffer) => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  return res.send(buffer)
}

export const getCharts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.getCharts(String(req.params.examId))
    return res.json(success(data))
  } catch (error) {
    return next(error)
  }
}

export const downloadClassReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getPdfPayload(`class report ${req.params.examId}`)
    return sendPdf(res, `class-report-${req.params.examId}.pdf`, buffer)
  } catch (error) {
    return next(error)
  }
}

export const downloadMarksheet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getPdfPayload(`marksheet ${req.params.examId}`)
    return sendPdf(res, `marksheet-${req.params.examId}.pdf`, buffer)
  } catch (error) {
    return next(error)
  }
}

export const downloadReportCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getPdfPayload(`report card ${req.params.examId} ${req.params.studentId}`)
    return sendPdf(res, `report-card-${req.params.examId}-${req.params.studentId}.pdf`, buffer)
  } catch (error) {
    return next(error)
  }
}

export const downloadReportCardsZip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = await reportService.getPdfPayload(`report cards zip ${req.params.examId}`)
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="report-cards-${req.params.examId}.zip"`)
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
}
