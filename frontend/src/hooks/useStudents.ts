'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
}

export const useStudents = (params: ListParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: async () => (await api.get('/students', { params })).data,
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await api.get(`/students/${id}`)).data,
    enabled: Boolean(id),
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/students', payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.put(`/students/${id}`, payload)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useTransferClass = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => (await api.put(`/students/${studentId}/class`, { classId })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['student', studentId] });
    },
  });
};
