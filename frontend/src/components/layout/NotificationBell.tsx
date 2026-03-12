'use client'
import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnread((res.data as { data?: { unread?: number } }).data?.unread ?? 0)
    } catch {}
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5')
      setNotifications((res.data as { data?: Notification[] }).data ?? [])
    } catch {}
  }

  useEffect(() => {
    void fetchUnread()
    const interval = setInterval(() => { void fetchUnread() }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) void fetchNotifications()
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnread(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-gray-800">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-[#2b6cb0] hover:underline">Mark all read</button>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">No notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 ${!n.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <button onClick={() => { router.push('/notifications'); setOpen(false) }}
              className="text-xs text-[#2b6cb0] hover:underline w-full text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
