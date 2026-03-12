'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, Notification, PaginatedResponse } from '@/types';

interface NotificationParams {
  page?: number;
  limit?: number;
  read?: 'true' | 'false';
}

export const useNotifications = (params: NotificationParams) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Notification[]; meta: PaginatedResponse<Notification>['meta'] }>('/notifications', {
        params,
      });
      return data;
    },
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ unread: number }>>('/notifications/unread-count');
      return data.data;
    },
    refetchInterval: 30000,
  });

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useClearAll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.delete('/notifications/clear-all'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
