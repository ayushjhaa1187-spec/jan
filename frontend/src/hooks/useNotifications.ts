'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useNotifications = () => useQuery({ queryKey: ['notifications'], queryFn: async () => (await api.get('/notifications')).data })
