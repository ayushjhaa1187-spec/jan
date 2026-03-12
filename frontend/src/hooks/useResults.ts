'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useResults = (examId: string) => useQuery({ queryKey: ['results', examId], queryFn: async () => (await api.get(`/results/${examId}`)).data, enabled: !!examId })
