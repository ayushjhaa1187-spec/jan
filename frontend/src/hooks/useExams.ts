'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Exam, PaginatedResponse } from '@/types';

interface ExamParams {
  page?: number;
  limit?: number;
  classId?: string;
  status?: string;
  search?: string;
}

export const useExams = (params: ExamParams) =>
  useQuery({
    queryKey: ['exams', params],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Exam>>>('/exams', { params })).data.data,
  });

export const useExam = (id: string) =>
  useQuery({
    queryKey: ['exam', id],
    queryFn: async () => (await api.get<ApiResponse<Exam>>(`/exams/${id}`)).data.data,
    enabled: Boolean(id),
  });

export const useExamMarksStatus = (id: string) =>
  useQuery({
    queryKey: ['exam', id, 'marks-status'],
    queryFn: async () => (await api.get(`/exams/${id}/marks-status`)).data.data,
    enabled: Boolean(id),
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['exams'] });
};

export const useCreateExam = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: Record<string, unknown>) => (await api.post('/exams', payload)).data, onSuccess: () => invalidate(qc) });
};
export const useSubmitReview = (id: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => (await api.patch(`/exams/${id}/submit-review`)).data, onSuccess: () => invalidate(qc) });
};
export const useApproveExam = (id: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => (await api.patch(`/exams/${id}/approve`)).data, onSuccess: () => invalidate(qc) });
};
export const useRejectExam = (id: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (reason: string) => (await api.patch(`/exams/${id}/reject`, { reason })).data, onSuccess: () => invalidate(qc) });
};
export const usePublishExam = (id: string) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async () => (await api.patch(`/exams/${id}/publish`)).data, onSuccess: () => invalidate(qc) });
};
