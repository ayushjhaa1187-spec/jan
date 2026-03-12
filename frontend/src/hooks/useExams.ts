'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useExams = () => useQuery({ queryKey: ['exams'], queryFn: async () => (await api.get('/exams')).data })
