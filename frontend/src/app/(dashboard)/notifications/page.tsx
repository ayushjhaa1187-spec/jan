'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useClearAll, useDeleteNotification, useMarkAllRead, useMarkAsRead, useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'

interface NotificationRow {
  id: string
  title: string
  message: string
  read: boolean
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const notifications = useNotifications({ page, limit: 10, read: filter === 'unread' ? 'false' : undefined })
  const markOne = useMarkAsRead()
  const markAll = useMarkAllRead()
  const del = useDeleteNotification()
  const clearAll = useClearAll()

  const rows: NotificationRow[] = notifications.data?.data ?? []
  const totalPages = notifications.data?.meta?.totalPages ?? 1

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-2">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>All</Button>
          <Button variant={filter === 'unread' ? 'primary' : 'secondary'} onClick={() => setFilter('unread')}>Unread</Button>
          <Button
            variant="secondary"
            loading={markAll.isPending}
            onClick={async () => {
              try { await markAll.mutateAsync(); toast.success('Marked all read') } catch { toast.error('Failed') }
            }}
          >
            Mark All Read
          </Button>
          <Button
            variant="danger"
            loading={clearAll.isPending}
            onClick={async () => {
              try { await clearAll.mutateAsync(); toast.success('Cleared') } catch { toast.error('Failed') }
            }}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((n) => (
          <div key={n.id} className={`rounded border p-3 ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={markOne.isPending}
                    onClick={async () => {
                      try { await markOne.mutateAsync(n.id); toast.success('Marked read') } catch { toast.error('Failed') }
                    }}
                  >
                    Read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  loading={del.isPending}
                  onClick={async () => {
                    try { await del.mutateAsync(n.id); toast.success('Deleted') } catch { toast.error('Failed') }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
