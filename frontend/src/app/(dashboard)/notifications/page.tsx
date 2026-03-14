'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import type { Notification } from '@/types'

interface NotificationResponse { data: Notification[]; meta: { totalPages: number } }

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  const notifications = useQuery({ queryKey: ['notifications', filter, page], queryFn: async () => (await api.get<NotificationResponse>('/notifications', { params: { page, limit: 10, read: filter === 'unread' ? false : undefined } })).data })
  const markOne = useMutation({ mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const markAll = useMutation({ mutationFn: async () => (await api.patch('/notifications/read-all')).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const deleteOne = useMutation({ mutationFn: async (id: string) => (await api.delete(`/notifications/${id}`)).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })
  const clearAll = useMutation({ mutationFn: async () => (await api.delete('/notifications/clear-all')).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['notifications'] }) } })

  return (
    <Card title="Notifications" actions={<div className="flex gap-2"><Button size="sm" variant="secondary" onClick={() => setFilter('all')}>All</Button><Button size="sm" variant="secondary" onClick={() => setFilter('unread')}>Unread</Button><Button size="sm" onClick={() => void markAll.mutateAsync()}>Mark all read</Button><Button size="sm" variant="danger" onClick={() => void clearAll.mutateAsync()}>Clear all</Button></div>}>
      <div className="space-y-2">{(notifications.data?.data ?? []).map((item) => <div key={item.id} className={`rounded border p-3 ${item.read ? 'bg-white' : 'bg-blue-50'}`}><p className="font-semibold">{item.title}</p><p className="text-sm text-gray-600">{item.message}</p><div className="mt-2 flex gap-2"><Button size="sm" variant="secondary" onClick={() => void markOne.mutateAsync(item.id)} disabled={item.read}>Mark as read</Button><Button size="sm" variant="danger" onClick={() => void deleteOne.mutateAsync(item.id)}>Delete</Button></div></div>)}</div>
      <div className="mt-4"><Pagination page={page} totalPages={notifications.data?.meta.totalPages ?? 1} onPageChange={setPage} /></div>
    </Card>
  )
}
