'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useExamSubjectMarks = (examId: string, subjectId: string) =>
  useQuery({
    queryKey: ['marks', examId, subjectId],
    queryFn: async () => (await api.get(`/marks/exam/${examId}/subject/${subjectId}`)).data,
    enabled: Boolean(examId) && Boolean(subjectId),
  });

export const useBulkCreateMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/marks/bulk', payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
  });
};

export const useBulkUpdateMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.put('/marks/bulk-update', payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
  });
};
