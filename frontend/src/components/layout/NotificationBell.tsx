'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { timeAgo } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const unread = useQuery<{ data: { count: number } }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    refetchInterval: 30000,
  })

  const notifications = useQuery<{ data: NotificationItem[] }>({
    queryKey: ['notifications', 'latest'],
    queryFn: async () => (await api.get('/notifications', { params: { page: 1, limit: 5 } })).data,
    enabled: open,
  })

  const markAllRead = useMutation({
    mutationFn: async () => (await api.patch('/notifications/read-all')).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return (
    <div className="relative">
      <button className="relative" onClick={() => setOpen((prev) => !prev)}>
        <Bell className="h-5 w-5 text-gray-700" />
        {(unread.data?.data.count ?? 0) > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">{unread.data?.data.count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Notifications</h4>
            <Button size="sm" variant="ghost" onClick={() => void markAllRead.mutateAsync()}>Mark all read</Button>
          </div>
          <div className="space-y-2">
            {(notifications.data?.data ?? []).map((item) => (
              <div key={item.id} className="rounded-lg border p-2">
                <p className="text-sm font-medium text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-600">{item.message}</p>
                <p className="mt-1 text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
              </div>
            ))}
          </div>
          <Link href="/notifications" className="mt-3 block text-sm font-medium text-[#2b6cb0]">View all</Link>
        </div>
      )}
    </div>
  )
}
