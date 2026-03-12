'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  classId?: string;
  search?: string;
}

export const useExams = (params: ListParams) =>
  useQuery({
    queryKey: ['exams', params],
    queryFn: async () => (await api.get('/exams', { params })).data,
  });

export const useExam = (id: string) =>
  useQuery({
    queryKey: ['exam', id],
    queryFn: async () => (await api.get(`/exams/${id}`)).data,
    enabled: Boolean(id),
  });

export const useExamMarksStatus = (id: string) =>
  useQuery({
    queryKey: ['exam-marks-status', id],
    queryFn: async () => (await api.get(`/exams/${id}/marks-status`)).data,
    enabled: Boolean(id),
  });

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/exams', payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

const useWorkflowAction = (
  pathBuilder: (id: string) => string,
  method: 'patch' | 'post' = 'patch',
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload?: Record<string, unknown> }) => {
      const path = pathBuilder(id);
      return method === 'patch'
        ? (await api.patch(path, payload ?? {})).data
        : (await api.post(path, payload ?? {})).data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['exams'] });
      void queryClient.invalidateQueries({ queryKey: ['exam-marks-status', variables.id] });
    },
  });
};

export const useSubmitReview = () => useWorkflowAction((id) => `/exams/${id}/submit-review`);
export const useApproveExam = () => useWorkflowAction((id) => `/exams/${id}/approve`);
export const useRejectExam = () => useWorkflowAction((id) => `/exams/${id}/reject`);
export const usePublishExam = () => useWorkflowAction((id) => `/exams/${id}/publish`);
