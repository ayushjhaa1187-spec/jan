'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface NotificationItem { id: string; title: string; message: string; read: boolean; createdAt: string }
interface NotificationResponse { data: { data: NotificationItem[]; meta: { page: number; totalPages: number } } }

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const queryClient = useQueryClient()

  const notifications = useQuery<NotificationResponse>({ queryKey: ['notifications', page, filter], queryFn: async () => (await api.get('/notifications', { params: { page, limit: 10, read: filter === 'UNREAD' ? false : undefined } })).data })
  const markRead = useMutation({ mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const remove = useMutation({ mutationFn: async (id: string) => (await api.delete(`/notifications/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const markAll = useMutation({ mutationFn: async () => (await api.patch('/notifications/read-all')).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const clearAll = useMutation({ mutationFn: async () => (await api.delete('/notifications/clear-all')).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })

  return (
    <Card title='Notifications' actions={<div className='flex gap-2'><Button size='sm' variant={filter === 'ALL' ? 'primary' : 'ghost'} onClick={() => setFilter('ALL')}>All</Button><Button size='sm' variant={filter === 'UNREAD' ? 'primary' : 'ghost'} onClick={() => setFilter('UNREAD')}>Unread</Button><Button size='sm' variant='secondary' onClick={() => void markAll.mutateAsync()}>Mark All Read</Button><Button size='sm' variant='danger' onClick={() => void clearAll.mutateAsync()}>Clear All</Button></div>}>
      <div className='space-y-2'>
        {(notifications.data?.data.data ?? []).map((item) => (
          <div key={item.id} className={`rounded-lg border p-3 ${item.read ? 'bg-white' : 'bg-blue-50'}`}>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <h4 className='font-semibold'>{item.title}</h4>
                <p className='text-sm text-gray-600'>{item.message}</p>
                <p className='text-xs text-gray-400'>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className='flex gap-2'>
                {!item.read && <Button size='sm' variant='ghost' onClick={() => void markRead.mutateAsync(item.id)}>Mark as Read</Button>}
                <Button size='sm' variant='danger' onClick={() => void remove.mutateAsync(item.id)}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-4'><Pagination page={notifications.data?.data.meta.page ?? 1} totalPages={notifications.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div>
    </Card>
  )
}
