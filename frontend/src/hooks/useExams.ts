'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface ExamsParams {
  page?: number
  limit?: number
  status?: string
  classId?: string
  search?: string
}

export const useExams = (params: ExamsParams) =>
  useQuery({
    queryKey: ['exams', params],
    queryFn: async () => (await api.get('/exams', { params })).data,
  })

export const useExam = (id: string) =>
  useQuery({
    queryKey: ['exam', id],
    queryFn: async () => (await api.get(`/exams/${id}`)).data,
    enabled: Boolean(id),
  })

export const useExamMarksStatus = (id: string) =>
  useQuery({
    queryKey: ['exam-marks-status', id],
    queryFn: async () => (await api.get(`/exams/${id}/marks-status`)).data,
    enabled: Boolean(id),
  })

export const useCreateExam = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; classId: string; startDate: string; endDate: string }) =>
      (await api.post('/exams', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['exams'] })
    },
  })
}

const createExamStatusMutation = (pathBuilder: (id: string) => string, key: string) => {
  return () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, payload }: { id: string; payload?: Record<string, string> }) =>
        (await api.patch(pathBuilder(id), payload || {})).data,
      onSuccess: async (_, variables) => {
        await queryClient.invalidateQueries({ queryKey: ['exam', variables.id] })
        await queryClient.invalidateQueries({ queryKey: ['exams'] })
        await queryClient.invalidateQueries({ queryKey: [key, variables.id] })
      },
    })
  }
}

export const useSubmitReview = createExamStatusMutation((id) => `/exams/${id}/submit-review`, 'exam-submit-review')
export const useApproveExam = createExamStatusMutation((id) => `/exams/${id}/approve`, 'exam-approve')
export const useRejectExam = createExamStatusMutation((id) => `/exams/${id}/reject`, 'exam-reject')
export const usePublishExam = createExamStatusMutation((id) => `/exams/${id}/publish`, 'exam-publish')
