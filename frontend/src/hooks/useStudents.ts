'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, PaginatedResponse, Student } from '@/types';

interface StudentParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
}

interface StudentPayload {
  adm_no: string;
  name: string;
  email?: string;
  phone?: string;
  classId: string;
}

export const useStudents = (params: StudentParams) =>
  useQuery({
    queryKey: ['students', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedResponse<Student>>>('/students', { params });
      return data.data;
    },
  });

export const useStudent = (id: string) =>
  useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Student>>(`/students/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StudentPayload) => api.post('/students', payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<StudentPayload> }) =>
      api.put(`/students/${id}`, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useTransferClass = (studentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (classId: string) => api.put(`/students/${studentId}/class`, { classId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['students'] });
      void queryClient.invalidateQueries({ queryKey: ['students', studentId] });
    },
  });
};
