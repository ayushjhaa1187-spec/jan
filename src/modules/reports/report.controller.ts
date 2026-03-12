import { NextFunction, Request, Response } from 'express';
import { success } from '../../utils/apiResponse';
import { reportService } from './report.service';

const sendFile = (res: Response, mime: string, filename: string, buffer: Buffer): Response => {
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(buffer);
};

export const downloadReportCardPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await reportService.generateReportCardPdf(String(req.params.examId), String(req.params.studentId));
    return sendFile(res, 'application/pdf', file.filename, file.buffer);
  } catch (error) {
    return next(error);
  }
};

export const downloadClassReportPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await reportService.generateClassReportPdf(String(req.params.examId));
    return sendFile(res, 'application/pdf', file.filename, file.buffer);
  } catch (error) {
    return next(error);
  }
};

export const downloadMarksheetPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await reportService.generateMarksheetPdf(String(req.params.examId));
    return sendFile(res, 'application/pdf', file.filename, file.buffer);
  } catch (error) {
    return next(error);
  }
};

export const getChartsData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.getChartData(String(req.params.examId));
    return res.json(success(data));
  } catch (error) {
    return next(error);
  }
};

export const downloadBulkReportCardsZip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await reportService.generateBulkReportCardsZip(String(req.params.examId));
    return sendFile(res, 'application/zip', file.filename, file.buffer);
  } catch (error) {
    return next(error);
  }
};
