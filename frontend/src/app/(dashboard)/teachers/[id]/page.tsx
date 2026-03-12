'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [assignClassId, setAssignClassId] = useState('');

  const teacher = useQuery({ queryKey: ['teacher', id], queryFn: async () => (await api.get(`/teachers/${id}`)).data.data });
  const assignments = useQuery({ queryKey: ['teacher-assignments', id], queryFn: async () => (await api.get(`/teacher-subjects/teacher/${id}`)).data.data, retry: 0 });
  const classes = useQuery({ queryKey: ['teacher-classes'], queryFn: async () => (await api.get('/classes')).data.data });

  const assignClassTeacher = useMutation({
    mutationFn: async () => api.post(`/classes/${assignClassId}/assign-teacher`, { teacherId: id }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['teacher', id] }),
  });

  return (
    <div className='space-y-6'>
      <Card title='Teacher Profile'>
        <div className='grid md:grid-cols-2 gap-3 text-sm'>
          <p><strong>Name:</strong> {teacher.data?.firstName} {teacher.data?.lastName}</p>
          <p><strong>Employee ID:</strong> {teacher.data?.employeeId}</p>
          <p><strong>Qualification:</strong> {teacher.data?.qualification ?? '-'}</p>
          <p><strong>Designation:</strong> {teacher.data?.designation ?? '-'}</p>
          <p><strong>Phone:</strong> {teacher.data?.phone ?? '-'}</p>
        </div>
      </Card>

      <Card title='Subject Assignments'>
        <Table columns={[
          { key: 'subject', label: 'Subject', render: (row: { subject?: { name?: string } }) => row.subject?.name ?? '-' },
          { key: 'class', label: 'Class', render: (row: { class?: { name?: string } }) => row.class?.name ?? '-' },
          { key: 'section', label: 'Section', render: (row: { class?: { section?: string } }) => row.class?.section ?? '-' },
          { key: 'year', label: 'Year', render: (row: { class?: { year?: number } }) => row.class?.year ?? '-' },
        ]} data={assignments.data ?? []} />
      </Card>

      <Card title='Assign as Class Teacher'>
        <div className='flex gap-2'>
          <select className='rounded-md border px-3 py-2 min-w-64' value={assignClassId} onChange={(event) => setAssignClassId(event.target.value)}>
            <option value=''>Select class</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
          <Button
            loading={assignClassTeacher.isPending}
            disabled={!assignClassId}
            onClick={async () => {
              try {
                await assignClassTeacher.mutateAsync();
                toast.success('Class teacher assigned successfully');
              } catch {
                toast.error('Assignment failed');
              }
            }}
          >
            Assign
          </Button>
        </div>
      </Card>
    </div>
  );
}
