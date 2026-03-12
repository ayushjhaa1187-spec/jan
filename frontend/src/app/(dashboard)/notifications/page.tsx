'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useClearAll, useDeleteNotification, useMarkAllRead, useMarkAsRead, useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { timeAgo } from '@/lib/utils'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [readFilter, setReadFilter] = useState<'all' | 'unread'>('all')
  const notifications = useNotifications({ page, limit: 20, read: readFilter === 'unread' ? 'false' : undefined })
  const markAsRead = useMarkAsRead()
  const markAllRead = useMarkAllRead()
  const remove = useDeleteNotification()
  const clearAll = useClearAll()

  return (
    <Card title='Notifications' actions={<div className='flex gap-2'><Button variant='secondary' onClick={() => setReadFilter((prev) => prev === 'all' ? 'unread' : 'all')}>{readFilter === 'all' ? 'Unread only' : 'All'}</Button><Button variant='secondary' onClick={async () => { try { await markAllRead.mutateAsync(); toast.success('Marked all as read') } catch { toast.error('Failed') } }}>Mark All Read</Button><Button variant='danger' onClick={async () => { try { await clearAll.mutateAsync(); toast.success('Cleared all notifications') } catch { toast.error('Failed') } }}>Clear All</Button></div>}>
      <div className='space-y-2'>
        {(notifications.data?.data?.data as Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }> | undefined)?.map((item) => (
          <div key={item.id} className={`rounded border p-3 ${item.read ? 'bg-white' : 'border-l-4 border-l-blue-500 bg-blue-50'}`}>
            <div className='flex items-start justify-between gap-2'>
              <div>
                <p className='font-semibold'>{item.title}</p>
                <p className='text-sm text-slate-600'>{item.message}</p>
                <p className='text-xs text-slate-500'>{timeAgo(item.createdAt)}</p>
              </div>
              <div className='flex gap-2'>
                {!item.read ? <Button size='sm' variant='secondary' onClick={async () => { try { await markAsRead.mutateAsync(item.id); toast.success('Marked as read') } catch { toast.error('Failed') } }}>Mark as Read</Button> : null}
                <Button size='sm' variant='danger' onClick={async () => { try { await remove.mutateAsync(item.id); toast.success('Deleted') } catch { toast.error('Failed') } }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-4'>
        <Pagination page={page} totalPages={notifications.data?.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
      </div>
    </Card>
  )
}
