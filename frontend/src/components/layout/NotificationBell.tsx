'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import { Button } from '../ui/Button'

interface NotifItem { id: string; title: string; message: string }

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const loadUnread = async () => {
    const response = await api.get('/notifications/unread-count')
    const count = (response.data as { data?: { unread?: number } }).data?.unread ?? 0
    setUnread(count)
  }

  const loadLatest = async () => {
    const response = await api.get('/notifications', { params: { page: 1, limit: 5 } })
    const data = (response.data as { data?: Notification[] }).data ?? []
    setItems(data)
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setUnread(0)
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  useEffect(() => {
    void loadUnread()
    const timer = setInterval(() => void loadUnread(), 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (open) {
      void loadLatest()
    }
  }, [open])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button className="relative rounded-lg p-2 hover:bg-gray-100" onClick={() => setOpen((v) => !v)}>
        <Bell size={18} />
        {unread > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] text-white">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-semibold">Notifications</p>
            <button className="text-xs text-[#2b6cb0]" onClick={() => void markAllRead()}>Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p> : items.map((item) => (
              <div key={item.id} className={`border-b px-4 py-3 ${item.read ? '' : 'bg-blue-50'}`}>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-gray-600">{item.message}</p>
                <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-center">
            <Link href="/notifications" className="text-xs text-[#2b6cb0]" onClick={() => setOpen(false)}>View all</Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
