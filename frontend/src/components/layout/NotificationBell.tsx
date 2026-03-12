'use client'
import { Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notifications','unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data.data,
    refetchInterval: 30000
  })
  return <div className='relative'><Bell size={20} /><span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-[10px] h-4 w-4 grid place-items-center'>{data?.unread ?? 0}</span></div>
}
