'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useResultsSummary = (examId: string) =>
  useQuery({
    queryKey: ['results-summary', examId],
    queryFn: async () => (await api.get(`/results/summary/${examId}`)).data,
    enabled: Boolean(examId),
  });

export const useExamResults = (examId: string) =>
  useQuery({
    queryKey: ['exam-results', examId],
    queryFn: async () => (await api.get(`/results/${examId}`)).data,
    enabled: Boolean(examId),
  });

export const useStudentResult = (examId: string, studentId: string) =>
  useQuery({
    queryKey: ['student-result', examId, studentId],
    queryFn: async () => (await api.get(`/results/${examId}/${studentId}`)).data,
    enabled: Boolean(examId) && Boolean(studentId),
  });

const useResultAction = (pathBuilder: (examId: string, force?: boolean) => string, method: 'post' | 'patch') => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, force }: { examId: string; force?: boolean }) =>
      method === 'post'
        ? (await api.post(pathBuilder(examId, force))).data
        : (await api.patch(pathBuilder(examId, force))).data,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['results-summary', variables.examId] });
      void queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] });
    },
  });
};

export const useGenerateResults = () => useResultAction((examId) => `/results/generate/${examId}`, 'post');
export const usePublishResults = () =>
  useResultAction((examId, force) => `/results/publish/${examId}${force ? '?force=true' : ''}`, 'patch');
