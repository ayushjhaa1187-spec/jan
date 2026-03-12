'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useStudent, useTransferClass } from '@/hooks/useStudents';
import { Class } from '@/types';

interface StudentResultRow {
  id: string;
  status: string;
  exam: { id: string; name: string };
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const studentId = params.id;
  const [classId, setClassId] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const studentQuery = useStudent(studentId);
  const resultsQuery = useQuery({
    queryKey: ['student-results', studentId],
    queryFn: async () => (await api.get<{ data: StudentResultRow[] }>(`/students/${studentId}/results`)).data.data,
  });
  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data,
  });

  const transferMutation = useTransferClass(studentId);

  return (
    <div className='space-y-4'>
      <Card title='Student Profile'>
        <p><strong>Name:</strong> {studentQuery.data?.name}</p>
        <p><strong>Adm No:</strong> {studentQuery.data?.adm_no}</p>
        <p><strong>Class:</strong> {studentQuery.data?.class?.name} {studentQuery.data?.class?.section}</p>
      </Card>

      <Card title='Results History'>
        <Table
          columns={[
            { key: 'exam', label: 'Exam', render: (row: StudentResultRow) => row.exam.name },
            { key: 'status', label: 'Status', render: (row: StudentResultRow) => <Badge status={row.status} /> },
          ]}
          data={resultsQuery.data || []}
        />
      </Card>

      <Card title='Transfer Class'>
        <div className='flex items-end gap-3'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>New class</label>
            <select className='h-10 rounded-md border border-slate-300 px-3' value={classId} onChange={(event) => setClassId(event.target.value)}>
              <option value=''>Select class</option>
              {(classesQuery.data || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.section}</option>
              ))}
            </select>
          </div>
          <Button disabled={!classId} onClick={() => setConfirmOpen(true)}>Transfer</Button>
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title='Confirm transfer'
        footer={(
          <>
            <Button variant='secondary' onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button
              loading={transferMutation.isPending}
              onClick={async () => {
                try {
                  await transferMutation.mutateAsync(classId);
                  toast.success('Student transferred');
                  setConfirmOpen(false);
                } catch {
                  toast.error('Transfer failed');
                }
              }}
            >
              Confirm
            </Button>
          </>
        )}
      >
        Transfer this student to selected class?
      </Modal>
    </div>
  );
}
