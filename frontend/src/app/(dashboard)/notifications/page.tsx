'use client'

import { useNotifications, useMarkAllRead } from '@/hooks/useNotifications'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
}

export default function NotificationsPage() {
  const { data, isPending } = useNotifications({})
  const markAllReadMutation = useMarkAllRead()
  const rows: NotificationItem[] = data?.data ?? []

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync()
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark notifications as read')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="bg-[#2b6cb0] text-white px-3 py-2 rounded"
          disabled={markAllReadMutation.isPending}
        >
          Mark All Read
        </button>
      </div>

      <div className="space-y-2">
        {isPending ? (
          <p className="text-sm text-gray-500">Loading notifications...</p>
        ) : (
          rows.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded bg-white ${notification.read ? '' : 'border-l-4 border-blue-500 bg-blue-50'}`}
            >
              <div className="font-semibold">{notification.title}</div>
              <div>{notification.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
