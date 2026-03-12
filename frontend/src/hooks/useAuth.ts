'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const useAuthMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>('/auth/me');
      return data.data;
    },
  });
