'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useExamSubjectMarks = (examId: string, subjectId: string) =>
  useQuery({
    queryKey: ['marks', examId, subjectId],
    queryFn: async () => (await api.get(`/marks/exam/${examId}/subject/${subjectId}`)).data,
    enabled: Boolean(examId && subjectId),
  })

export const useBulkCreateMarks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { examId: string; subjectId: string; entries: Array<{ studentId: string; marks: number; maxMarks?: number; remarks?: string }> }) =>
      (await api.post('/marks/bulk', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['marks'] })
    },
  })
}

export const useBulkUpdateMarks = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { updates: Array<{ id: string; marks: number; remarks?: string }> }) =>
      (await api.put('/marks/bulk-update', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['marks'] })
    },
  })
}
