'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Notification } from '@/types';
import api from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadCount = async () => {
    try {
      const { data } = await api.get<{ data: { unread: number } }>('/notifications/unread-count');
      setUnreadCount(data.data.unread);
    } catch {
      // silent polling failure
    }
  };

  const loadLatest = async () => {
    const { data } = await api.get<{ data: Notification[] }>('/notifications', { params: { page: 1, limit: 5 } });
    setItems(data.data);
  };

  useEffect(() => {
    void loadCount();
    const timer = window.setInterval(() => void loadCount(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadLatest();
  }, [open]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      toast.success('All notifications marked as read');
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <div ref={rootRef} className='relative'>
      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        className='relative rounded p-2 hover:bg-slate-100'
      >
        <Bell size={20} />
        {unreadCount > 0 ? (
          <span className='absolute -right-1 -top-1 inline-grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white'>
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className='absolute right-0 z-40 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl'>
          <div className='mb-2 flex items-center justify-between'>
            <h4 className='text-sm font-semibold'>Notifications</h4>
            <Button size='sm' variant='ghost' onClick={markAllRead}>
              Mark all read
            </Button>
          </div>
          <div className='max-h-72 space-y-2 overflow-auto'>
            {items.length === 0 ? <p className='text-sm text-slate-500'>No notifications</p> : null}
            {items.map((item) => (
              <div key={item.id} className='rounded border border-slate-200 p-2'>
                <div className='flex items-center gap-2'>
                  <span className={`h-2 w-2 rounded-full ${item.read ? 'bg-slate-300' : 'bg-blue-500'}`} />
                  <p className='text-sm font-medium'>{item.title}</p>
                </div>
                <p className='truncate text-xs text-slate-600'>{item.message}</p>
                <p className='text-[11px] text-slate-400'>{timeAgo(item.createdAt)}</p>
              </div>
            ))}
          </div>
          <div className='mt-3 text-right'>
            <Link href='/notifications' className='text-sm font-medium text-primary-light'>
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
