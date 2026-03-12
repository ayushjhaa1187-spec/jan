'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface NotificationParams {
  page?: number;
  limit?: number;
  read?: 'true' | 'false';
}

export const useNotifications = (params: NotificationParams) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => (await api.get('/notifications', { params })).data,
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications-unread'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    refetchInterval: 30000,
  });

const useNotificationAction = <TVariables,>(mutationFn: (variables: TVariables) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAsRead = () =>
  useNotificationAction((id: string) => api.patch(`/notifications/${id}/read`));

export const useMarkAllRead = () =>
  useNotificationAction(() => api.patch('/notifications/read-all'));

export const useDeleteNotification = () =>
  useNotificationAction((id: string) => api.delete(`/notifications/${id}`));

export const useClearAll = () =>
  useNotificationAction(() => api.delete('/notifications/clear-all'));
