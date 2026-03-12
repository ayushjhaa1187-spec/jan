'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Class, Teacher, TeacherSubject } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';

export default function TeacherDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [classId, setClassId] = useState('');
  const queryClient = useQueryClient();

  const teacherQuery = useQuery({ queryKey: ['teacher', id], queryFn: async () => (await api.get<{ data: Teacher }>(`/teachers/${id}`)).data.data });
  const assignmentsQuery = useQuery({ queryKey: ['teacher', id, 'assignments'], queryFn: async () => (await api.get<{ data: TeacherSubject[] }>(`/teacher-subjects/teacher/${id}`)).data.data });
  const classesQuery = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data });

  const assignMutation = useMutation({
    mutationFn: async (payload: { classId: string }) => api.post(`/teachers/${id}/assign-class-teacher`, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['teacher', id] }),
  });

  return (
    <div className='space-y-4'>
      <Card title='Teacher Profile'>
        <p><strong>Name:</strong> {`${teacherQuery.data?.firstName || ''} ${teacherQuery.data?.lastName || ''}`.trim()}</p>
        <p><strong>Employee ID:</strong> {teacherQuery.data?.employeeId}</p>
        <p><strong>Qualification:</strong> {teacherQuery.data?.qualification || '-'}</p>
        <p><strong>Designation:</strong> {teacherQuery.data?.designation || '-'}</p>
        <p><strong>Phone:</strong> {teacherQuery.data?.phone || '-'}</p>
      </Card>

      <Card title='Subject Assignments'>
        <Table
          columns={[
            { key: 'subject', label: 'Subject', render: (row: TeacherSubject) => row.subject?.name || '-' },
            { key: 'class', label: 'Class', render: (row: TeacherSubject) => row.class?.name || '-' },
            { key: 'section', label: 'Section', render: (row: TeacherSubject) => row.class?.section || '-' },
          ]}
          data={assignmentsQuery.data || []}
        />
      </Card>

      <Card title='Assign as Class Teacher'>
        <div className='flex items-end gap-3'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Class</label>
            <select className='h-10 rounded-md border border-slate-300 px-3' value={classId} onChange={(event) => setClassId(event.target.value)}>
              <option value=''>Select class</option>
              {(classesQuery.data || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.section}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={async () => {
              if (!classId) return;
              try {
                await assignMutation.mutateAsync({ classId });
                toast.success('Assignment updated');
              } catch {
                toast.error('Assignment failed');
              }
            }}
            loading={assignMutation.isPending}
          >
            Assign
          </Button>
        </div>
      </Card>
    </div>
  );
}
