'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse } from '@/types';

export const useExamSubjectMarks = (examId: string, subjectId: string) =>
  useQuery({
    queryKey: ['marks', examId, subjectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/marks/exam/${examId}/subject/${subjectId}`);
      return data.data;
    },
    enabled: Boolean(examId && subjectId),
  });

export const useBulkCreateMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => api.post('/marks/bulk', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
  });
};

export const useBulkUpdateMarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => api.put('/marks/bulk-update', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marks'] });
    },
  });
};
