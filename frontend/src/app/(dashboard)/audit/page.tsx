'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, Column } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/EmptyState'

interface LogRow { id: string; action: string; entity: string; user?: { name: string }; createdAt: string }
interface LogRes { data: LogRow[]; meta: { page: number; totalPages: number } }

export default function AuditPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [page, setPage] = useState(1)
  const [user, setUser] = useState('')
  const [action, setAction] = useState('')
  const [entity, setEntity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const logs = useQuery<{ data: LogRes }>({ queryKey: ['audit', page, user, action, entity, startDate, endDate], queryFn: async () => (await api.get('/audit', { params: { page, limit: 20, user, action, entity, startDate: startDate || undefined, endDate: endDate || undefined } })).data, enabled: role === 'Principal' })

  if (role !== 'Principal') {
    return <EmptyState title="Access Denied" description="Only Principal can access audit logs." />
  }
  const cols: Column<LogRow>[] = [{ key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'user', label: 'User', render: (r) => r.user?.name ?? '-' }, { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() }]
  return <Card title="Audit Logs"><div className="mb-3 grid gap-2 md:grid-cols-5"><Input placeholder="User" value={user} onChange={(e) => setUser(e.target.value)} /><Input placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} /><Input placeholder="Entity" value={entity} onChange={(e) => setEntity(e.target.value)} /><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div><Table columns={cols} data={logs.data?.data.data ?? []} keyExtractor={(r) => r.id} loading={logs.isLoading} /><div className="mt-4"><Pagination page={logs.data?.data.meta.page ?? 1} totalPages={logs.data?.data.meta.totalPages ?? 1} onPageChange={setPage} /></div></Card>
}
