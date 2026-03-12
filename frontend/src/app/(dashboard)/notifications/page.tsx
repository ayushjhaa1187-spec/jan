'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import {
  useClearAll,
  useDeleteNotification,
  useMarkAllRead,
  useMarkAsRead,
  useNotifications,
} from '@/hooks/useNotifications';
import { Notification } from '@/types';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all');

  const notificationsQuery = useNotifications({
    page,
    limit: 20,
    read: readFilter === 'unread' ? 'false' : undefined,
  });

  const markOneMutation = useMarkAsRead();
  const markAllMutation = useMarkAllRead();
  const deleteMutation = useDeleteNotification();
  const clearMutation = useClearAll();

  const items = notificationsQuery.data?.data || [];
  const meta = notificationsQuery.data?.meta;

  return (
    <Card title='Notifications'>
      <div className='mb-4 flex flex-wrap gap-2'>
        <Button variant={readFilter === 'all' ? 'primary' : 'secondary'} onClick={() => setReadFilter('all')}>All</Button>
        <Button variant={readFilter === 'unread' ? 'primary' : 'secondary'} onClick={() => setReadFilter('unread')}>Unread only</Button>
        <Button variant='secondary' onClick={async () => { try { await markAllMutation.mutateAsync(); toast.success('All marked as read'); } catch { toast.error('Failed'); } }}>
          Mark All Read
        </Button>
        <Button variant='danger' onClick={async () => { try { await clearMutation.mutateAsync(); toast.success('All notifications cleared'); } catch { toast.error('Failed'); } }}>
          Clear All
        </Button>
      </div>

      <div className='space-y-2'>
        {items.map((item: Notification) => (
          <div key={item.id} className={`rounded border p-3 ${item.read ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50 border-l-4'}`}>
            <p className='font-semibold'>{item.title}</p>
            <p className='text-sm text-slate-600'>{item.message}</p>
            <p className='text-xs text-slate-500'>{timeAgo(item.createdAt)}</p>
            <div className='mt-2 flex gap-2'>
              {!item.read ? <Button size='sm' variant='secondary' onClick={async () => { try { await markOneMutation.mutateAsync(item.id); toast.success('Marked as read'); } catch { toast.error('Failed'); } }}>Mark as Read</Button> : null}
              <Button size='sm' variant='danger' onClick={async () => { try { await deleteMutation.mutateAsync(item.id); toast.success('Deleted'); } catch { toast.error('Delete failed'); } }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-4'>
        <Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} />
      </div>
    </Card>
  );
}
