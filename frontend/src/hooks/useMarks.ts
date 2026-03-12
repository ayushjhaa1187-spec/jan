'use client'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export const useBulkMarksSave = () => useMutation({ mutationFn: async (payload: unknown) => (await api.post('/marks/bulk', payload)).data })
