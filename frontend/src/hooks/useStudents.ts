'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useStudents = (page = 1) => useQuery({ queryKey: ['students', page], queryFn: async () => (await api.get('/students', { params: { page, limit: 20 } })).data })
