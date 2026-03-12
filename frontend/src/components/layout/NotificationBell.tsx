'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Notification } from '@/types';
import { Button } from '../ui/Button';

interface UnreadResponse {
  unread: number;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const fetchCount = async () => {
    const response = await api.get<{ success: boolean; data: UnreadResponse }>('/notifications/unread-count');
    setCount(response.data.data.unread);
  };

  const fetchLatest = async () => {
    const response = await api.get<{ success: boolean; data: Notification[] }>('/notifications', { params: { limit: 5, page: 1 } });
    setItems(response.data.data);
  };

  useEffect(() => {
    void fetchCount();
    const interval = window.setInterval(() => {
      void fetchCount();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      void fetchLatest();
    }
  }, [open]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    await fetchCount();
    await fetchLatest();
  };

  return (
    <div className='relative' ref={rootRef}>
      <button
        className='relative rounded p-2 hover:bg-slate-100'
        onClick={() => setOpen((value) => !value)}
        aria-label='Notifications'
      >
        <Bell size={18} />
        {count > 0 ? (
          <span className='absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-600 text-white text-[10px] grid place-items-center'>
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className='absolute right-0 mt-2 w-80 rounded-lg border bg-white shadow-lg z-50'>
          <div className='p-3 border-b flex items-center justify-between'>
            <h4 className='font-semibold text-sm'>Notifications</h4>
            <Button variant='ghost' size='sm' onClick={() => void markAllRead()}>Mark all read</Button>
          </div>
          <div className='max-h-80 overflow-auto'>
            {items.map((item) => (
              <div key={item.id} className={`px-3 py-2 border-b ${item.read ? 'bg-white' : 'bg-blue-50'}`}>
                <p className='text-xs font-semibold'>{item.title}</p>
                <p className='text-xs text-slate-600 truncate'>{item.message}</p>
                <p className='text-[11px] text-slate-500 mt-1'>{timeAgo(item.createdAt)}</p>
              </div>
            ))}
          </div>
          <Link href='/notifications' className='block text-center text-sm p-2 hover:bg-slate-50'>
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
