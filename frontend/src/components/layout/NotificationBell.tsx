'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '../ui/Button'

interface NotifItem { id: string; title: string; message: string }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const unread = useQuery<{ data: { unread: number } }>({ queryKey: ['unread-count'], queryFn: async () => (await api.get('/notifications/unread-count')).data, refetchInterval: 30000 })
  const notifications = useQuery<{ data: NotifItem[] }>({ queryKey: ['notifications-mini'], queryFn: async () => (await api.get('/notifications', { params: { limit: 5 } })).data, enabled: open })
  const markAll = useMutation({ mutationFn: async () => (await api.patch('/notifications/read-all')).data, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['unread-count'] }); await queryClient.invalidateQueries({ queryKey: ['notifications-mini'] }) } })

  return <div className="relative"><button onClick={() => setOpen((p) => !p)} className="relative rounded-md p-2 hover:bg-gray-100"><Bell size={18} />{(unread.data?.data.unread ?? 0) > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread.data?.data.unread}</span> : null}</button>{open ? <div className="absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg p-3 z-30"><div className="mb-2 flex justify-between items-center"><p className="font-semibold text-sm">Notifications</p><Button size="sm" variant="ghost" onClick={() => markAll.mutate()}>Mark all read</Button></div><div className="space-y-2">{(notifications.data?.data ?? []).map((n) => <div key={n.id} className="rounded border p-2"><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-gray-500">{n.message}</p></div>)}</div><Link className="mt-3 block text-sm text-[#2b6cb0]" href="/notifications" onClick={() => setOpen(false)}>View all</Link></div> : null}</div>
}
