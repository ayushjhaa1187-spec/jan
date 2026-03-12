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

interface CreateExamPayload {
  name: string;
  classId: string;
  startDate: string;
  endDate: string;
}

export const useExams = (params: ExamParams) =>
  useQuery({
    queryKey: ['exams', params],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Exam[]; meta: PaginatedResponse<Exam>['meta'] }>('/exams', {
        params,
      });
      return data;
    },
  });

export const useExam = (id: string) =>
  useQuery({
    queryKey: ['exam', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Exam>>(`/exams/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useExamMarksStatus = (id: string) =>
  useQuery({
    queryKey: ['exam', id, 'marks-status'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/exams/${id}/marks-status`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateExamPayload) => api.post<ApiResponse<Exam>>('/exams', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useSubmitReview = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch(`/exams/${id}/submit-review`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exam', id] });
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useApproveExam = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch(`/exams/${id}/approve`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exam', id] });
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useRejectExam = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => api.patch(`/exams/${id}/reject`, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exam', id] });
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const usePublishExam = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch(`/exams/${id}/publish`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exam', id] });
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};
