'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'

interface NotifItem { 
  id: string; 
  title: string; 
  message: string;
  read?: boolean;
  createdAt: string;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotifItem[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const loadUnread = async () => {
    try {
      const response = await api.get('/notifications/unread-count')
      const count = (response.data as { data?: { unread?: number } }).data?.unread ?? 0
      setUnread(count)
    } catch {
      // silenced
    }
  }

  const loadLatest = async () => {
    try {
      const response = await api.get('/notifications', { params: { page: 1, limit: 5 } })
      const data = (response.data as { data?: any }).data ?? []
      setItems(data.data || data)
    } catch {
      // silenced
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // silenced
    }
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
      <button 
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors" 
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      
      {open ? (
        <div className="absolute right-0 z-[100] mt-3 w-80 rounded-xl border border-gray-100 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-bold text-gray-800">Notifications</span>
            <button 
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
              onClick={() => void markAllRead()}
            >
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Bell size={32} className="text-gray-200 mb-2" />
                <p className="text-sm text-gray-500">All caught up!</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={`px-4 py-3.5 transition-colors ${item.read ? 'hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase">{timeAgo(item.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t bg-gray-50/50 px-4 py-3 text-center rounded-b-xl">
            <Link 
              href="/notifications" 
              className="text-xs font-bold text-blue-600 hover:text-blue-800" 
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
