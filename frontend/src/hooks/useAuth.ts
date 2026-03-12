'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useAuthMe = () =>
  useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => (await api.get('/auth/me')).data,
  })
