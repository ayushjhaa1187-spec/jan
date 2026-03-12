'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useExamSubjectMarks = (examId: string, subjectId: string) =>
  useQuery({
    queryKey: ['marks', examId, subjectId],
    queryFn: async () => (await api.get(`/marks/exam/${examId}/subject/${subjectId}`)).data.data,
    enabled: Boolean(examId && subjectId),
  });

export const useBulkCreateMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/marks/bulk', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks'] }),
  });
};

export const useBulkUpdateMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.put('/marks/bulk-update', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marks'] }),
  });
};
