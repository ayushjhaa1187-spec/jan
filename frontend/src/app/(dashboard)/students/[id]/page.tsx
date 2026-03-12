'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { formatPercent } from '@/lib/utils';
import api from '@/lib/api';
import { useTransferClass } from '@/hooks/useStudents';

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [classId, setClassId] = useState('');
  const [confirmTransfer, setConfirmTransfer] = useState(false);

  const student = useQuery({ queryKey: ['student', id], queryFn: async () => (await api.get(`/students/${id}`)).data.data });
  const results = useQuery({ queryKey: ['student-results', id], queryFn: async () => (await api.get(`/students/${id}/results`)).data.data });
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data.data });
  const transfer = useTransferClass(id);

  const studentData = student.data;
  const rows = results.data ?? [];

  return (
    <div className='space-y-6'>
      <Card title='Student Information'>
        <div className='grid md:grid-cols-2 gap-3 text-sm'>
          <p><strong>Name:</strong> {studentData?.name}</p>
          <p><strong>Adm No:</strong> {studentData?.adm_no}</p>
          <p><strong>Email:</strong> {studentData?.email ?? '-'}</p>
          <p><strong>Class:</strong> {studentData?.class?.name} {studentData?.class?.section}</p>
        </div>
      </Card>

      <Card title='Results History'>
        <Table
          columns={[
            { key: 'exam', label: 'Exam', render: (row: { exam: { name: string } }) => row.exam.name },
            { key: 'total', label: 'Total', render: () => '-' },
            { key: 'percentage', label: 'Percentage', render: () => formatPercent(0) },
            { key: 'grade', label: 'Grade', render: () => '-' },
            { key: 'status', label: 'Status', render: (row: { status: string }) => <Badge status={row.status} /> },
          ]}
          data={rows}
        />
      </Card>

      <Card title='Transfer Class'>
        <div className='flex gap-2'>
          <select className='rounded-md border px-3 py-2 min-w-64' value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value=''>Select new class</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
          <Button disabled={!classId} onClick={() => setConfirmTransfer(true)}>Transfer</Button>
        </div>
      </Card>

      <Modal
        open={confirmTransfer}
        onClose={() => setConfirmTransfer(false)}
        title='Confirm Transfer'
        footer={
          <>
            <Button variant='secondary' onClick={() => setConfirmTransfer(false)}>Cancel</Button>
            <Button
              loading={transfer.isPending}
              onClick={async () => {
                try {
                  await transfer.mutateAsync(classId);
                  toast.success('Student transferred successfully');
                  setConfirmTransfer(false);
                } catch {
                  toast.error('Failed to transfer student');
                }
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p>Do you want to transfer this student to the selected class?</p>
      </Modal>
    </div>
  );
}
