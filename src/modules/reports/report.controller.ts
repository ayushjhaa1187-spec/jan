import { NextFunction, Request, Response } from 'express'
import { success } from '../../utils/apiResponse'

const sampleCharts = {
  gradeDistribution: [
    { label: 'A', value: 12 },
    { label: 'B', value: 18 },
    { label: 'C', value: 8 },
  ],
  subjectAverages: [
    { label: 'Math', value: 72 },
    { label: 'Science', value: 68 },
  ],
  passFailDistribution: [
    { label: 'Pass', value: 32 },
    { label: 'Fail', value: 6 },
    { label: 'Incomplete', value: 2 },
  ],
  topPerformers: [
    { label: 'S1', value: 95 },
    { label: 'S2', value: 92 },
  ],
}

const sendReport = (res: Response, type: string, examId?: string, studentId?: string) => {
  const content = `Report generated for ${type} | exam=${examId || '-'} | student=${studentId || '-'}`
  res.setHeader('Content-Type', 'application/pdf')
  return res.send(Buffer.from(content, 'utf-8'))
}

export const getCharts = async (_req: Request, res: Response, _next: NextFunction) => {
  return res.json(success(sampleCharts))
}

export const downloadClassReport = async (req: Request, res: Response, _next: NextFunction) => {
  return sendReport(res, 'class-report', String(req.params.examId))
}

export const downloadMarksheet = async (req: Request, res: Response, _next: NextFunction) => {
  return sendReport(res, 'marksheet', String(req.params.examId))
}

export const downloadReportCard = async (req: Request, res: Response, _next: NextFunction) => {
  return sendReport(res, 'report-card', String(req.params.examId), String(req.params.studentId))
}

export const downloadReportCardsZip = async (req: Request, res: Response, _next: NextFunction) => {
  return sendReport(res, 'report-cards-zip', String(req.params.examId))
}
