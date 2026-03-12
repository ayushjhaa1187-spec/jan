'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { useClearAll, useDeleteNotification, useMarkAllRead, useMarkAsRead, useNotifications } from '@/hooks/useNotifications';
import { timeAgo } from '@/lib/utils';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const notifications = useNotifications({ page, limit: 20, read: unreadOnly ? 'false' : undefined });
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();
  const remove = useDeleteNotification();
  const clearAll = useClearAll();

  const rows = notifications.data?.data ?? [];
  const meta = notifications.data?.meta;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2 items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Notifications</h1>
        <div className='flex gap-2'>
          <Button variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly(false)}>All</Button>
          <Button variant={unreadOnly ? 'secondary' : 'primary'} onClick={() => setUnreadOnly(true)}>Unread only</Button>
        </div>
      </div>

      <div className='flex gap-2'>
        <Button onClick={async () => { try { await markAllRead.mutateAsync(undefined); toast.success('All notifications marked as read'); } catch { toast.error('Failed'); } }}>Mark All Read</Button>
        <Button variant='danger' onClick={async () => { try { await clearAll.mutateAsync(undefined); toast.success('All notifications cleared'); } catch { toast.error('Failed'); } }}>Clear All</Button>
      </div>

      <div className='space-y-2'>
        {rows.map((item: { id: string; title: string; message: string; read: boolean; createdAt: string }) => (
          <div key={item.id} className={`rounded-lg border p-3 ${item.read ? 'bg-white' : 'bg-blue-50 border-l-4 border-l-blue-500'}`}>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='font-semibold'>{item.title}</p>
                <p className='text-sm text-slate-600'>{item.message}</p>
                <p className='text-xs text-slate-500 mt-1'>{timeAgo(item.createdAt)}</p>
              </div>
              <div className='flex gap-2'>
                {!item.read ? <Button size='sm' variant='secondary' onClick={async () => { try { await markAsRead.mutateAsync(item.id); toast.success('Marked as read'); } catch { toast.error('Failed'); } }}>Mark as Read</Button> : null}
                <Button size='sm' variant='danger' onClick={async () => { try { await remove.mutateAsync(item.id); toast.success('Deleted'); } catch { toast.error('Failed'); } }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
      {meta?.unread !== undefined ? <Badge status='REVIEW' label={`Unread: ${meta.unread}`} /> : null}
    </div>
  );
}
