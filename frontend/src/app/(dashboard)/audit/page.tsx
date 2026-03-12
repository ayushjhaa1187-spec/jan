'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { formatDate } from '@/lib/utils';

export default function AuditPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);

  const [applied, setApplied] = useState({ userFilter: '', actionFilter: '', entityFilter: '', startDate: '', endDate: '' });

  const audit = useQuery({
    queryKey: ['audit', page, applied],
    queryFn: async () => (await api.get('/audit', { params: { page, limit: 50, userId: applied.userFilter || undefined, action: applied.actionFilter || undefined, entity: applied.entityFilter || undefined, startDate: applied.startDate || undefined, endDate: applied.endDate || undefined } })).data,
    enabled: user?.role === 'Principal',
  });

  if (user?.role !== 'Principal') {
    return <EmptyState title='Access Denied' description='Only Principal can access audit logs.' />;
  }

  return (
    <div className='space-y-4'>
      <Card title='Filters'>
        <div className='grid gap-3 md:grid-cols-3'>
          <Input label='User ID' value={userFilter} onChange={(event) => setUserFilter(event.target.value)} />
          <Input label='Action' value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} />
          <Input label='Entity' value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)} />
          <Input label='Start Date' type='datetime-local' value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <Input label='End Date' type='datetime-local' value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <div className='flex items-end'><Button onClick={() => { setPage(1); setApplied({ userFilter, actionFilter, entityFilter, startDate, endDate }); }}>Apply Filters</Button></div>
        </div>
      </Card>

      <Card title='Audit Logs'>
        <Table
          loading={audit.isLoading}
          data={audit.data?.data ?? []}
          columns={[
            { key: 'user', label: 'User', render: (row) => row.user?.email ?? '-' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'entityId', label: 'Entity ID', render: (row) => row.entityId ?? '-' },
            { key: 'ipAddress', label: 'IP Address', render: (row) => row.ipAddress ?? '-' },
            { key: 'time', label: 'Time', render: (row) => formatDate(row.createdAt) },
            { key: 'details', label: 'Details', render: (row) => row.details ? <Button size='sm' variant='secondary' onClick={() => setDetails(row.details)}>View</Button> : '-' },
          ]}
        />
      </Card>

      <Pagination page={audit.data?.meta?.page ?? 1} totalPages={audit.data?.meta?.totalPages ?? 1} onPageChange={setPage} />

      <Modal open={Boolean(details)} onClose={() => setDetails(null)} title='Audit Details'>
        <pre className='overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100'>{JSON.stringify(details, null, 2)}</pre>
      </Modal>
    </div>
  );
}
