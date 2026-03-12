'use client';

import Link from 'next/link';
import { Bell, Circle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useClearAll, useMarkAllRead, useNotifications, useUnreadCount } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils';
import { Button } from '../ui/Button';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = useUnreadCount();
  const list = useNotifications({ limit: 5, page: 1 });
  const markAll = useMarkAllRead();
  const clearAll = useClearAll();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className='relative' ref={ref}>
      <button className='relative rounded p-2 hover:bg-slate-100' onClick={() => setOpen((v) => !v)} type='button'>
        <Bell size={20} />
        {(unread.data?.unread ?? 0) > 0 ? (
          <span className='absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-red-500 px-1 text-[10px] text-white'>
            {unread.data?.unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className='absolute right-0 z-50 mt-2 w-96 rounded-lg border bg-white p-2 shadow-xl'>
          <div className='mb-2 flex items-center justify-between p-2'>
            <h4 className='font-semibold'>Notifications</h4>
            <div className='flex gap-2'>
              <Button size='sm' variant='ghost' onClick={() => markAll.mutate()}>Mark all read</Button>
              <Button size='sm' variant='ghost' onClick={() => clearAll.mutate()}>Clear</Button>
            </div>
          </div>
          <div className='max-h-80 overflow-y-auto'>
            {(list.data?.data ?? []).map((item) => (
              <div key={item.id} className='border-t p-2'>
                <div className='flex items-start gap-2'>
                  <Circle size={10} className={item.read ? 'text-slate-300 mt-1' : 'text-blue-500 mt-1'} fill='currentColor' />
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold'>{item.title}</p>
                    <p className='truncate text-xs text-slate-600'>{item.message}</p>
                    <p className='text-xs text-slate-400'>{timeAgo(item.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='border-t p-2 text-right text-sm'>
            <Link href='/notifications' onClick={() => setOpen(false)} className='text-[#1a365d]'>View all</Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
