'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { AuditLog } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';

export default function AuditPage() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);

  const auditQuery = useQuery({
    queryKey: ['audit', page, userId, action, entity, startDate, endDate],
    queryFn: async () =>
      (
        await api.get<{ data: AuditLog[]; meta: { totalPages: number } }>('/audit', {
          params: {
            page,
            limit: 50,
            userId: userId || undefined,
            action: action || undefined,
            entity: entity || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        })
      ).data,
    enabled: user?.role === 'Principal',
  });

  if (user?.role !== 'Principal') {
    return <EmptyState title='Access Denied' description='Only Principal can view audit logs.' />;
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
          <div className='flex items-end'><Button onClick={() => setPage(1)}>Apply Filters</Button></div>
        </div>
      </Card>

      <Card title='Audit Logs'>
        <Table
          columns={[
            { key: 'user', label: 'User', render: (row: AuditLog) => row.user?.email || '-' },
            { key: 'action', label: 'Action' },
            { key: 'entity', label: 'Entity' },
            { key: 'entityId', label: 'Entity ID', render: (row: AuditLog) => row.entityId || '-' },
            { key: 'ipAddress', label: 'IP Address', render: (row: AuditLog) => row.ipAddress || '-' },
            { key: 'time', label: 'Time', render: (row: AuditLog) => new Date(row.createdAt).toLocaleString() },
            { key: 'details', label: 'Details', render: (row: AuditLog) => <Button size='sm' variant='secondary' onClick={() => setDetails((row.details as Record<string, unknown>) || {})}>View</Button> },
          ]}
          data={auditQuery.data?.data || []}
        />
        <div className='mt-4'>
          <Pagination page={page} totalPages={auditQuery.data?.meta.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>

      <Modal open={Boolean(details)} onClose={() => setDetails(null)} title='Audit Details'>
        <pre className='max-h-64 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100'>{JSON.stringify(details, null, 2)}</pre>
      </Modal>
    </div>
  );
}
