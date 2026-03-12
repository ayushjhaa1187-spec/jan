'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'

export default function AuditPage() {
  const user = useAuthStore((state) => state.user)
  const [page, setPage] = useState(1)
  const [userId, setUserId] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [detailsOpen, setDetailsOpen] = useState<Record<string, unknown> | null>(null)
  const [appliedFilters, setAppliedFilters] = useState({ userId: '', action: '', entity: '', startDate: '', endDate: '' })

  const audit = useQuery({
    queryKey: ['audit', page, appliedFilters],
    queryFn: async () => (await api.get('/audit', { params: { page, limit: 50, ...appliedFilters } })).data,
    enabled: user?.role === 'Principal',
  })

  if (user?.role !== 'Principal') {
    return <EmptyState title='Access Denied' description='Only principal can view audit logs.' />
  }

  return (
    <div className='space-y-4'>
      <Card title='Audit Filters'>
        <div className='grid gap-3 md:grid-cols-3'>
          <Input label='User ID' value={userId} onChange={(event) => setUserId(event.target.value)} />
          <Input label='Action' value={action} onChange={(event) => setAction(event.target.value)} />
          <Input label='Entity' value={entity} onChange={(event) => setEntity(event.target.value)} />
          <Input label='Start Date' type='datetime-local' value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input label='End Date' type='datetime-local' value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <div className='flex items-end'>
            <Button onClick={() => setAppliedFilters({ userId, action, entity, startDate, endDate })}>Apply Filters</Button>
          </div>
        </div>
      </Card>

      <Card title='Audit Logs'>
        <Table
          columns={[
            { key: 'user', label: 'User', render: (row) => (row as { user?: { email?: string } }).user?.email || '-' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'entityId', label: 'Entity ID' },
            { key: 'ipAddress', label: 'IP Address' },
            { key: 'createdAt', label: 'Time', render: (row) => new Date((row as { createdAt: string }).createdAt).toLocaleString() },
            { key: 'details', label: 'Details', render: (row) => <button className='text-[#2b6cb0]' onClick={() => setDetailsOpen((row as { details?: Record<string, unknown> }).details || {})}>View</button> },
          ]}
          data={audit.data?.data?.data ?? []}
          loading={audit.isLoading}
        />
        <div className='mt-4'>
          <Pagination page={page} totalPages={audit.data?.data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={Boolean(detailsOpen)} onClose={() => setDetailsOpen(null)} title='Audit Details'>
        <pre className='whitespace-pre-wrap text-xs'>{JSON.stringify(detailsOpen, null, 2)}</pre>
      </Modal>
    </div>
  )
}
