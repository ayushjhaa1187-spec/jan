'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useResultsSummary = (examId: string) => useQuery({
  queryKey: ['results-summary', examId],
  queryFn: async () => (await api.get(`/results/summary/${examId}`)).data,
  enabled: Boolean(examId),
})

export const useExamResults = (examId: string) => useQuery({
  queryKey: ['results', examId],
  queryFn: async () => (await api.get(`/results/${examId}`)).data,
  enabled: Boolean(examId),
})

export const useStudentResult = (examId: string, studentId: string) => useQuery({
  queryKey: ['result', examId, studentId],
  queryFn: async () => (await api.get(`/results/${examId}/${studentId}`)).data,
  enabled: Boolean(examId && studentId),
})

export const useGenerateResults = (examId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post(`/results/generate/${examId}`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['results', examId] })
      await queryClient.invalidateQueries({ queryKey: ['results-summary', examId] })
    },
  })
}

export const usePublishResults = (examId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (force?: boolean) => (await api.patch(`/results/publish/${examId}${force ? '?force=true' : ''}`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['results', examId] })
      await queryClient.invalidateQueries({ queryKey: ['results-summary', examId] })
    },
  })
}
