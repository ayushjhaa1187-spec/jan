'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'

interface AuditRow { id: string; action: string; entity: string; createdAt: string; user: { name: string; email: string } }
interface AuditResponse { data: AuditRow[]; meta: { totalPages: number } }

export default function AuditPage() {
  const role = useAuthStore((state) => state.user?.role)
  const [page, setPage] = useState(1)
  const [user, setUser] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const audit = useQuery({ queryKey: ['audit', page, user, action, entity, startDate, endDate], enabled: role === 'Principal', queryFn: async () => (await api.get<AuditResponse>('/audit', { params: { page, limit: 20, user: user || undefined, action: action || undefined, entity: entity || undefined, startDate: startDate || undefined, endDate: endDate || undefined } })).data })

  if (role !== 'Principal') {
    return <EmptyState title="Access Denied" description="Only Principal can access audit logs." />
  }

  const columns: Column<AuditRow>[] = [
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'user', label: 'User', render: (row) => row.user.name },
    { key: 'createdAt', label: 'Timestamp', render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  return (
    <Card title="Audit Log">
      <div className="mb-4 grid gap-2 md:grid-cols-5">
        <input className="rounded border px-3 py-2" placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} />
        <input className="rounded border px-3 py-2" placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} />
        <input className="rounded border px-3 py-2" placeholder="Entity" value={entity} onChange={(e) => setEntity(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Table columns={columns} data={audit.data?.data ?? []} keyExtractor={(row) => row.id} loading={audit.isLoading} />
      <div className="mt-4"><Pagination page={page} totalPages={audit.data?.meta.totalPages ?? 1} onPageChange={setPage} /></div>
    </Card>
  )
}
