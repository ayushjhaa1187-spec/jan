'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse } from '@/types';

export const useResultsSummary = (examId: string) =>
  useQuery({
    queryKey: ['results', 'summary', examId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/results/summary/${examId}`);
      return data.data;
    },
    enabled: Boolean(examId),
  });

export const useExamResults = (examId: string) =>
  useQuery({
    queryKey: ['results', examId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/results/${examId}`);
      return data.data;
    },
    enabled: Boolean(examId),
  });

export const useStudentResult = (examId: string, studentId: string) =>
  useQuery({
    queryKey: ['results', examId, studentId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/results/${examId}/${studentId}`);
      return data.data;
    },
    enabled: Boolean(examId && studentId),
  });

export const useGenerateResults = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post(`/results/generate/${examId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['results', examId] });
      void queryClient.invalidateQueries({ queryKey: ['results', 'summary', examId] });
    },
  });
};

export const usePublishResults = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (force = false) => api.patch(`/results/publish/${examId}${force ? '?force=true' : ''}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['results', examId] });
      void queryClient.invalidateQueries({ queryKey: ['results', 'summary', examId] });
    },
  });
};
