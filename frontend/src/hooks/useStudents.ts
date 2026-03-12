'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

interface StudentQueryParams {
  page?: number
  limit?: number
  search?: string
  classId?: string
}

export const useStudents = (params: StudentQueryParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: async () => (await api.get('/students', { params })).data,
  })

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await api.get(`/students/${id}`)).data,
    enabled: Boolean(id),
  })

export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { adm_no: string; name: string; classId: string; email?: string; phone?: string }) =>
      (await api.post('/students', payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { adm_no?: string; name?: string; classId?: string; email?: string; phone?: string } }) =>
      (await api.put(`/students/${id}`, payload)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useTransferClass = (studentId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (classId: string) => (await api.put(`/students/${studentId}/class`, { classId })).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['students'] })
      await queryClient.invalidateQueries({ queryKey: ['student', studentId] })
    },
  })
}
