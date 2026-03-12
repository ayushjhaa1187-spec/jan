'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { useClearAll, useDeleteNotification, useMarkAllRead, useMarkAsRead, useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const notifications = useNotifications({ page, limit: 20, read: unreadOnly ? 'false' : undefined });
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();
  const deleteOne = useDeleteNotification();
  const clearAll = useClearAll();

  return (
    <div className='space-y-4'>
      <Card title='Notifications' actions={<div className='flex gap-2'><Button size='sm' variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly((value) => !value)}>{unreadOnly ? 'Unread only' : 'All'}</Button><Button size='sm' onClick={() => markAllRead.mutate(undefined, { onSuccess: () => toast.success('All notifications marked as read') })}>Mark All Read</Button><Button size='sm' variant='danger' onClick={() => clearAll.mutate(undefined, { onSuccess: () => toast.success('Notifications cleared') })}>Clear All</Button></div>}>
        <div className='space-y-2'>
          {(notifications.data?.data ?? []).map((item) => (
            <div key={item.id} className={`rounded border p-3 ${item.read ? 'bg-white' : 'border-l-4 border-l-blue-500 bg-blue-50/40'}`}>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='font-semibold'>{item.title}</p>
                  <p className='text-sm text-slate-600'>{item.message}</p>
                  <p className='text-xs text-slate-400'>{timeAgo(item.createdAt)}</p>
                </div>
                <div className='flex gap-2'>
                  {!item.read ? <Button size='sm' variant='secondary' onClick={() => markAsRead.mutate(item.id, { onSuccess: () => toast.success('Marked as read') })}>Mark as Read</Button> : null}
                  <Button size='sm' variant='danger' onClick={() => deleteOne.mutate(item.id, { onSuccess: () => toast.success('Deleted') })}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Pagination page={notifications.data?.meta.page ?? 1} totalPages={notifications.data?.meta.totalPages ?? 1} onPageChange={setPage} />
    </div>
  );
}
