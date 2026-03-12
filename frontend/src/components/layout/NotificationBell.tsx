'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import api from '@/lib/api'
import { Notification } from '@/types'
import { timeAgo } from '@/lib/utils'

export function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const fetchUnreadCount = async () => {
    const { data } = await api.get('/notifications/unread-count')
    setCount((data as { data: { unread: number } }).data.unread)
  }

  const fetchLatestNotifications = async () => {
    const { data } = await api.get('/notifications', { params: { limit: 5, page: 1 } })
    const payload = data as { data: Notification[] }
    setItems(payload.data)
  }

  useEffect(() => {
    void fetchUnreadCount()
    const timer = setInterval(() => {
      void fetchUnreadCount()
    }, 30000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!open) return
    void fetchLatestNotifications()
  }, [open])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    void fetchUnreadCount()
    void fetchLatestNotifications()
  }

  return (
    <div className='relative' ref={wrapperRef}>
      <button className='relative rounded p-2 hover:bg-slate-100' onClick={() => setOpen((prev) => !prev)}>
        <Bell size={20} />
        {count > 0 ? <span className='absolute right-1 top-1 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] text-white'>{count}</span> : null}
      </button>
      {open ? (
        <div className='absolute right-0 z-50 mt-2 w-80 rounded-md border bg-white shadow-xl'>
          <div className='flex items-center justify-between border-b px-3 py-2'>
            <p className='text-sm font-semibold'>Notifications</p>
            <button className='text-xs text-[#2b6cb0]' onClick={markAllRead}>Mark all read</button>
          </div>
          <div className='max-h-72 overflow-y-auto'>
            {items.length === 0 ? (
              <p className='px-3 py-4 text-center text-sm text-slate-500'>No notifications</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className='border-b px-3 py-2'>
                  <div className='flex items-center gap-2'>
                    <span className={`h-2 w-2 rounded-full ${item.read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                    <p className='text-sm font-medium'>{item.title}</p>
                  </div>
                  <p className='line-clamp-2 text-xs text-slate-600'>{item.message}</p>
                  <p className='text-[11px] text-slate-400'>{timeAgo(item.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <div className='px-3 py-2 text-right'>
            <Link href='/notifications' className='text-xs text-[#2b6cb0]' onClick={() => setOpen(false)}>View all</Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
