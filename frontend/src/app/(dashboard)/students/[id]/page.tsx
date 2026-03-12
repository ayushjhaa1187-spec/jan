'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useTransferClass } from '@/hooks/useStudents';
import api from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { formatPercent } from '@/lib/utils';
import { useState } from 'react';

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const studentId = String(params.id);
  const [classId, setClassId] = useState('');
  const [confirm, setConfirm] = useState(false);

  const student = useQuery({ queryKey: ['student', studentId], queryFn: async () => (await api.get(`/students/${studentId}`)).data.data });
  const results = useQuery({ queryKey: ['student-results', studentId], queryFn: async () => (await api.get(`/students/${studentId}/results`)).data.data });
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });
  const transfer = useTransferClass(studentId);

  const profile = student.data;

  return (
    <div className='space-y-4'>
      <Card title='Student Profile'>
        <div className='grid gap-2 md:grid-cols-2'>
          <p><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</p>
          <p><strong>Adm No:</strong> {profile?.enrollmentNo}</p>
          <p><strong>Class:</strong> {profile?.class?.name}</p>
          <p><strong>Section:</strong> {profile?.class?.section}</p>
          <p><strong>Phone:</strong> {profile?.phone ?? '-'}</p>
          <p><strong>Email:</strong> {profile?.user?.email ?? '-'}</p>
        </div>
      </Card>

      <Card title='Results History'>
        <Table
          loading={results.isLoading}
          data={results.data ?? []}
          columns={[
            { key: 'exam', label: 'Exam Name', render: (row) => row.exam?.name ?? '-' },
            { key: 'total', label: 'Total', render: (row) => String((row.total as number | undefined) ?? '-') },
            { key: 'max', label: 'Max', render: (row) => String((row.max as number | undefined) ?? '-') },
            { key: 'percentage', label: 'Percentage', render: (row) => typeof row.percentage === 'number' ? formatPercent(row.percentage) : '-' },
            { key: 'grade', label: 'Grade', render: (row) => row.grade ?? '-' },
            { key: 'status', label: 'Status', render: (row) => <Badge status={String(row.status ?? 'INCOMPLETE')} /> },
          ]}
        />
      </Card>

      <Card title='Transfer Class'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>New Class</label>
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className='h-10 rounded-md border border-slate-300 px-3'>
              <option value=''>Select class</option>
              {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
                <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
              ))}
            </select>
          </div>
          <Button disabled={!classId} onClick={() => setConfirm(true)}>Transfer</Button>
        </div>
      </Card>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title='Confirm Transfer'
        footer={<><Button variant='secondary' onClick={() => setConfirm(false)}>Cancel</Button><Button onClick={async () => {
          try {
            await transfer.mutateAsync(classId);
            toast.success('Student transferred successfully');
            setConfirm(false);
          } catch {
            toast.error('Transfer failed');
          }
        }}>Confirm</Button></>}
      >
        Are you sure you want to transfer this student to the selected class?
      </Modal>
    </div>
  );
}
