'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface NRow { id: string; title: string; message: string; read: boolean; createdAt: string }
interface NRes { data: NRow[]; meta: { page: number; totalPages: number } }

export default function NotificationsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [page, setPage] = useState(1)
  const data = useQuery<{ data: NRes }>({ queryKey: ['notifications', filter, page], queryFn: async () => (await api.get('/notifications', { params: { page, limit: 10, read: filter === 'UNREAD' ? false : undefined } })).data })
  const markRead = useMutation({ mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['notifications'] }) } })
  const deleteOne = useMutation({ mutationFn: async (id: string) => (await api.delete(`/notifications/${id}`)).data, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['notifications'] }) } })
  const markAll = useMutation({ mutationFn: async () => (await api.patch('/notifications/read-all')).data, onSuccess: async () => { toast.success('All read'); await qc.invalidateQueries({ queryKey: ['notifications'] }) } })
  const clearAll = useMutation({ mutationFn: async () => (await api.delete('/notifications/clear-all')).data, onSuccess: async () => { toast.success('Cleared'); await qc.invalidateQueries({ queryKey: ['notifications'] }) } })

  return <Card title="Notifications" actions={<div className="flex gap-2"><Button variant={filter === 'ALL' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('ALL')}>All</Button><Button variant={filter === 'UNREAD' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('UNREAD')}>Unread</Button><Button variant="ghost" size="sm" onClick={() => markAll.mutate()}>Mark All Read</Button><Button variant="danger" size="sm" onClick={() => clearAll.mutate()}>Clear All</Button></div>}><div className="space-y-2">{(data.data?.data.data ?? []).map((n) => <div key={n.id} className={`rounded border p-3 ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-300'}`}><div className="flex justify-between"><div><p className="font-medium">{n.title}</p><p className="text-sm text-gray-600">{n.message}</p><p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p></div><div className="flex gap-1">{!n.read ? <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>Read</Button> : null}<Button size="sm" variant="danger" onClick={() => deleteOne.mutate(n.id)}>Delete</Button></div></div></div>)}</div><div className="mt-4"><Pagination page={data.data?.data.meta.page ?? 1} totalPages={data.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div></Card>
}
