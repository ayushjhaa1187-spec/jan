'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Notification, PaginatedResponse } from '@/types';

interface NotificationParams {
  page?: number;
  limit?: number;
  read?: 'true' | 'false';
}

export const useNotifications = (params: NotificationParams) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get<{ data: Notification[]; meta: PaginatedResponse<Notification>['meta'] }>('/notifications', { params });
      return data;
    },
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get<{ data: { unread: number } }>('/notifications/unread-count')).data.data,
    refetchInterval: 30000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useClearAll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.delete('/notifications/clear-all'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
