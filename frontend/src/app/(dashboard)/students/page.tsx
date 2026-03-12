'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { useCreateStudent, useDeleteStudent, useStudents, useUpdateStudent } from '@/hooks/useStudents';
import { Class, Student } from '@/types';

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  classId: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const studentsQuery = useStudents({ page, limit: 20, search: debouncedSearch || undefined, classId: classId || undefined });
  const classesQuery = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data,
  });

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { adm_no: '', name: '', email: '', phone: '', classId: '' },
  });

  useEffect(() => {
    if (editTarget) {
      form.reset({
        adm_no: editTarget.adm_no,
        name: editTarget.name,
        email: editTarget.email || '',
        phone: editTarget.phone || '',
        classId: editTarget.classId,
      });
    }
  }, [editTarget, form]);

  const students = studentsQuery.data?.data || [];
  const meta = studentsQuery.data?.meta;

  const closeForm = () => {
    setCreateOpen(false);
    setEditTarget(null);
    form.reset({ adm_no: '', name: '', email: '', phone: '', classId: '' });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, payload: values });
        toast.success('Student updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Student created');
      }
      closeForm();
    } catch {
      toast.error('Operation failed');
    }
  });

  const rows = useMemo(() => students, [students]);

  return (
    <div className='space-y-4'>
      <Card
        title='Students'
        actions={<Button onClick={() => setCreateOpen(true)}>Add Student</Button>}
      >
        <div className='mb-4 grid gap-3 md:grid-cols-3'>
          <Input label='Search' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search by name or adm no' />
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Class</label>
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className='h-10 w-full rounded-md border border-slate-300 px-3'>
              <option value=''>All classes</option>
              {(classesQuery.data || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.section}</option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={[
            { key: 'adm_no', label: 'Adm No' },
            { key: 'name', label: 'Name' },
            { key: 'class', label: 'Class-Section', render: (row: Student) => `${row.class?.name || ''} ${row.class?.section || ''}` },
            {
              key: 'actions',
              label: 'Actions',
              render: (row: Student) => (
                <div className='flex gap-2'>
                  <Button size='sm' variant='secondary' onClick={() => setEditTarget(row)} leftIcon={<Pencil size={14} />}>Edit</Button>
                  <Button size='sm' variant='danger' onClick={() => setDeleteTarget(row)} leftIcon={<Trash2 size={14} />}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={rows}
          loading={studentsQuery.isLoading}
        />

        <div className='mt-4'>
          <Pagination page={page} totalPages={meta?.totalPages || 1} onPageChange={setPage} />
        </div>
      </Card>

      <Modal
        open={createOpen || Boolean(editTarget)}
        onClose={closeForm}
        title={editTarget ? 'Edit Student' : 'Add Student'}
        footer={(
          <>
            <Button variant='secondary' onClick={closeForm}>Cancel</Button>
            <Button onClick={onSubmit} loading={createMutation.isPending || updateMutation.isPending}>Save</Button>
          </>
        )}
      >
        <form className='space-y-3'>
          <Input label='Admission No' error={form.formState.errors.adm_no?.message} {...form.register('adm_no')} />
          <Input label='Name' error={form.formState.errors.name?.message} {...form.register('name')} />
          <Input label='Email' error={form.formState.errors.email?.message} {...form.register('email')} />
          <Input label='Phone' {...form.register('phone')} />
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Class</label>
            <select {...form.register('classId')} className='h-10 w-full rounded-md border border-slate-300 px-3'>
              <option value=''>Select class</option>
              {(classesQuery.data || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.section}</option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title='Delete Student'
        footer={(
          <>
            <Button variant='secondary' onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant='danger'
              loading={deleteMutation.isPending}
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  await deleteMutation.mutateAsync(deleteTarget.id);
                  toast.success('Student deleted');
                  setDeleteTarget(null);
                } catch {
                  toast.error('Failed to delete student');
                }
              }}
            >
              Delete
            </Button>
          </>
        )}
      >
        <p>Delete {deleteTarget?.name}?</p>
      </Modal>
    </div>
  );
}
