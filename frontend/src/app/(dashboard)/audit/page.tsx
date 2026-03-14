'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'

interface Row { id: string; action: string; entity: string; entityId?: string; user: { name: string }; createdAt: string }

export default function AuditPage() {
  const { user } = useAuthStore()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ user: '', action: '', entity: '', startDate: '', endDate: '' })

  const logs = useQuery({ queryKey: ['audit', page, filters], queryFn: async () => (await api.get('/audit', { params: { ...filters, page, limit: 20 } })).data, enabled: user?.role === 'Principal' })

  if (user?.role !== 'Principal') {
    return <EmptyState title="Access Denied" description="Only principal can access audit logs." />
  }

  const rows: Row[] = logs.data?.data ?? []
  const totalPages = logs.data?.meta?.totalPages ?? 1

  return <Card title="Audit Logs"><div className="grid md:grid-cols-5 gap-3 mb-4"><Input placeholder="User" value={filters.user} onChange={(e) => setFilters((p) => ({ ...p, user: e.target.value }))} /><Input placeholder="Action" value={filters.action} onChange={(e) => setFilters((p) => ({ ...p, action: e.target.value }))} /><Input placeholder="Entity" value={filters.entity} onChange={(e) => setFilters((p) => ({ ...p, entity: e.target.value }))} /><Input type="date" value={filters.startDate} onChange={(e) => setFilters((p) => ({ ...p, startDate: e.target.value }))} /><Input type="date" value={filters.endDate} onChange={(e) => setFilters((p) => ({ ...p, endDate: e.target.value }))} /></div><div className="overflow-x-auto"><table className="w-full"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.user?.name}</td><td>{r.action}</td><td>{r.entity}</td><td>{r.entityId ?? '-'}</td></tr>)}</tbody></table></div><div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div></Card>
}
