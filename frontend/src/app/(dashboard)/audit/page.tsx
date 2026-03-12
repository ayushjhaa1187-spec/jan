'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function AuditPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [page, setPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState({ userSearch: '', action: '', entity: '', startDate: '', endDate: '' });
  const [selectedDetails, setSelectedDetails] = useState<Record<string, unknown> | null>(null);

  const audit = useQuery({
    queryKey: ['audit', page, applied],
    queryFn: async () =>
      (
        await api.get('/audit', {
          params: {
            page,
            limit: 50,
            userId: applied.userSearch || undefined,
            action: applied.action || undefined,
            entity: applied.entity || undefined,
            startDate: applied.startDate || undefined,
            endDate: applied.endDate || undefined,
          },
        })
      ).data,
    enabled: role === 'Principal',
    retry: 0,
  });

  if (role !== 'Principal') {
    return <EmptyState title='Access Denied' description='Only Principal can view audit logs.' />;
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold'>Audit Log</h1>
      <div className='grid md:grid-cols-5 gap-2'>
        <Input placeholder='User ID' value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
        <Input placeholder='Action' value={action} onChange={(event) => setAction(event.target.value)} />
        <Input placeholder='Entity' value={entity} onChange={(event) => setEntity(event.target.value)} />
        <Input type='date' value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        <Input type='date' value={endDate} onChange={(event) => setEndDate(event.target.value)} />
      </div>
      <Button onClick={() => { setApplied({ userSearch, action, entity, startDate, endDate }); setPage(1); }}>Apply Filters</Button>

      <Table columns={[
        { key: 'user', label: 'User', render: (row: { user?: { email?: string } }) => row.user?.email ?? 'System' },
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Entity' },
        { key: 'entityId', label: 'Entity ID' },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'time', label: 'Time', render: (row: { createdAt: string }) => formatDate(row.createdAt) },
        { key: 'details', label: 'Details', render: (row: { details?: Record<string, unknown> | null }) => row.details ? <Button size='sm' variant='secondary' onClick={() => setSelectedDetails(row.details || null)}>View</Button> : '-' },
      ]} data={audit.data?.data ?? []} loading={audit.isLoading} />

      <Pagination page={audit.data?.meta?.page ?? page} totalPages={audit.data?.meta?.totalPages ?? 1} onPageChange={setPage} />

      <Modal open={Boolean(selectedDetails)} onClose={() => setSelectedDetails(null)} title='Audit Details'>
        <pre className='text-xs overflow-auto max-h-80'>{JSON.stringify(selectedDetails, null, 2)}</pre>
      </Modal>
    </div>
  );
}
