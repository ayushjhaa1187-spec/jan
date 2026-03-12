'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Student } from '@/types';

interface StudentParams {
  page?: number;
  limit?: number;
  classId?: string;
  search?: string;
}

export const useStudents = (params: StudentParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: async () => (await api.get<ApiResponse<PaginatedResponse<Student>>>('/students', { params })).data.data,
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ['student', id],
    queryFn: async () => (await api.get<ApiResponse<Student>>(`/students/${id}`)).data.data,
    enabled: Boolean(id),
  });

export const useCreateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post('/students', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useUpdateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => (await api.put(`/students/${id}`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useDeleteStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/students/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
};

export const useTransferClass = (studentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => (await api.put(`/students/${studentId}/class`, { classId })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', studentId] });
    },
  });
};
