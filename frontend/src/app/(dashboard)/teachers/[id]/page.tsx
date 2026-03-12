'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { useState } from 'react';

export default function TeacherDetailPage() {
  const params = useParams<{ id: string }>();
  const teacherId = String(params.id);
  const qc = useQueryClient();
  const [classId, setClassId] = useState('');

  const teacher = useQuery({ queryKey: ['teacher', teacherId], queryFn: async () => (await api.get(`/teachers/${teacherId}`)).data.data });
  const assignments = useQuery({ queryKey: ['teacher-subjects', teacherId], queryFn: async () => (await api.get(`/teachers/${teacherId}/subjects`)).data.data });
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });

  const assign = useMutation({
    mutationFn: async (selectedClassId: string) => api.put(`/teachers/${teacherId}/assign-class-teacher`, { classId: selectedClassId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teacher', teacherId] }),
  });

  return (
    <div className='space-y-4'>
      <Card title='Teacher Profile'>
        <div className='grid gap-2 md:grid-cols-2'>
          <p><strong>Name:</strong> {teacher.data?.firstName} {teacher.data?.lastName}</p>
          <p><strong>Employee ID:</strong> {teacher.data?.employeeId}</p>
          <p><strong>Qualification:</strong> {teacher.data?.qualification ?? '-'}</p>
          <p><strong>Designation:</strong> {teacher.data?.designation ?? '-'}</p>
          <p><strong>Phone:</strong> {teacher.data?.phone ?? '-'}</p>
        </div>
      </Card>

      <Card title='Subject Assignments'>
        <Table
          loading={assignments.isLoading}
          data={assignments.data ?? []}
          columns={[
            { key: 'subject', label: 'Subject', render: (row) => row.subject?.name ?? '-' },
            { key: 'class', label: 'Class', render: (row) => row.class?.name ?? '-' },
            { key: 'section', label: 'Section', render: (row) => row.class?.section ?? '-' },
            { key: 'year', label: 'Year', render: (row) => String(row.class?.year ?? '-') },
          ]}
        />
      </Card>

      <Card title='Assign as Class Teacher'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Class</label>
            <select className='h-10 rounded border border-slate-300 px-3' value={classId} onChange={(event) => setClassId(event.target.value)}>
              <option value=''>Select class</option>
              {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
            </select>
          </div>
          <Button onClick={async () => {
            if (!classId) return;
            try {
              await assign.mutateAsync(classId);
              toast.success('Assigned successfully');
            } catch {
              toast.error('Assignment failed');
            }
          }}>Assign</Button>
        </div>
      </Card>
    </div>
  );
}
