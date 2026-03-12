'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useResultsSummary = (examId: string) =>
  useQuery({
    queryKey: ['results', examId, 'summary'],
    queryFn: async () => (await api.get(`/results/summary/${examId}`)).data.data,
    enabled: Boolean(examId),
  });

export const useExamResults = (examId: string) =>
  useQuery({
    queryKey: ['results', examId],
    queryFn: async () => (await api.get(`/results/${examId}`)).data.data,
    enabled: Boolean(examId),
  });

export const useStudentResult = (examId: string, studentId: string) =>
  useQuery({
    queryKey: ['results', examId, studentId],
    queryFn: async () => (await api.get(`/results/${examId}/${studentId}`)).data.data,
    enabled: Boolean(examId && studentId),
  });

export const useGenerateResults = (examId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post(`/results/generate/${examId}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['results', examId] }),
  });
};

export const usePublishResults = (examId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (force: boolean) => (await api.patch(`/results/publish/${examId}${force ? '?force=true' : ''}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['results', examId] }),
  });
};
