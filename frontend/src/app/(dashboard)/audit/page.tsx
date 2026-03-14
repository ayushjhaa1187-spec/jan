'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { ShieldAlert } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'

interface AuditRow { id: string; action: string; entity: string; entityId?: string; user?: { name: string; email: string }; createdAt: string }
interface AuditResponse { data: { data: AuditRow[]; meta: { page: number; totalPages: number } } }

export default function AuditPage() {
  const role = useAuthStore((state) => state.user?.role)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ user: '', action: '', entity: '', startDate: '', endDate: '' })

  const audit = useQuery<AuditResponse>({
    queryKey: ['audit', page, filters],
    queryFn: async () => (await api.get('/audit', { params: { page, limit: 20, ...filters } })).data,
    enabled: role === 'Principal'
  })

  if (role !== 'Principal') {
    return <EmptyState icon={<ShieldAlert className='h-6 w-6' />} title='Access Denied' description='Only Principal can access audit logs.' />
  }

  return (
    <Card title='Audit Log'>
      <div className='mb-4 grid gap-2 md:grid-cols-5'>
        <Input placeholder='User' value={filters.user} onChange={(event) => setFilters((prev) => ({ ...prev, user: event.target.value }))} />
        <Input placeholder='Action' value={filters.action} onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))} />
        <Input placeholder='Entity' value={filters.entity} onChange={(event) => setFilters((prev) => ({ ...prev, entity: event.target.value }))} />
        <Input type='date' value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
        <Input type='date' value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
      </div>
      <Table columns={[{ key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'entityId', label: 'Entity ID' }, { key: 'user', label: 'User', render: (row) => row.user?.name ?? '-' }, { key: 'createdAt', label: 'Created At', render: (row) => new Date(row.createdAt).toLocaleString() }]} data={audit.data?.data.data ?? []} loading={audit.isLoading} keyExtractor={(row) => row.id} />
      <div className='mt-4'><Pagination page={audit.data?.data.meta.page ?? 1} totalPages={audit.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div>
    </Card>
  )
}
