'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { useCreateStudent, useDeleteStudent, useStudents, useUpdateStudent } from '@/hooks/useStudents';
import api from '@/lib/api';
import { Student } from '@/types';

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  classId: z.string().uuid('Class is required'),
});

type FormValues = z.infer<typeof schema>;

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [editing, setEditing] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const students = useStudents({ page, limit: 20, search: debouncedSearch, classId: classId || undefined });
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const qc = useQueryClient();

  const classes = useQuery({
    queryKey: ['classes', 'all'],
    queryFn: async () => (await api.get('/classes?limit=200')).data.data.data,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const rows = students.data?.data ?? [];
  const meta = students.data?.meta;

  const startCreate = () => {
    setEditing(null);
    reset({ adm_no: '', name: '', email: '', phone: '', classId: '' });
    setOpen(true);
  };

  const startEdit = (item: Student) => {
    setEditing(item);
    reset({
      adm_no: item.enrollmentNo ?? item.adm_no ?? '',
      name: item.name ?? `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
      email: item.email ?? '',
      phone: item.phone ?? '',
      classId: item.classId,
    });
    setOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        await updateStudent.mutateAsync({ id: editing.id, payload: values });
        toast.success('Student updated successfully');
      } else {
        await createStudent.mutateAsync(values);
        toast.success('Student created successfully');
      }
      setOpen(false);
      qc.invalidateQueries({ queryKey: ['students'] });
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Operation failed')
        : 'Operation failed';
      toast.error(message);
    }
  };

  const deleteName = useMemo(() => {
    if (!deleteTarget) return '';
    return deleteTarget.name ?? `${deleteTarget.firstName ?? ''} ${deleteTarget.lastName ?? ''}`.trim();
  }, [deleteTarget]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div className='flex flex-wrap gap-3'>
          <Input label='Search' value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Search name / adm no' />
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Class</label>
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className='h-10 rounded-md border border-slate-300 px-3'>
              <option value=''>All classes</option>
              {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
                <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={startCreate}>Add Student</Button>
      </div>

      <Table
        loading={students.isLoading}
        data={rows}
        columns={[
          { key: 'adm', label: 'Adm No', render: (row) => row.enrollmentNo ?? row.adm_no ?? '-' },
          { key: 'name', label: 'Name', render: (row) => row.name ?? `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() },
          { key: 'class', label: 'Class-Section', render: (row) => `${row.class?.name ?? '-'} ${row.class?.section ?? ''}` },
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
              <div className='flex gap-2'>
                <Button size='sm' variant='secondary' onClick={() => startEdit(row)}>Edit</Button>
                <Button size='sm' variant='danger' onClick={() => setDeleteTarget(row)}>Delete</Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination page={meta?.page ?? 1} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Student' : 'Create Student'}
        footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Save</Button></>}
      >
        <div className='grid gap-3'>
          <Input label='Admission Number' {...register('adm_no')} error={errors.adm_no?.message} />
          <Input label='Name' {...register('name')} error={errors.name?.message} />
          <Input label='Email' {...register('email')} error={errors.email?.message} />
          <Input label='Phone' {...register('phone')} error={errors.phone?.message} />
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Class</label>
            <select className='h-10 w-full rounded border border-slate-300 px-3' {...register('classId')}>
              <option value=''>Select class</option>
              {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
                <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
              ))}
            </select>
            {errors.classId ? <p className='text-xs text-red-600'>{errors.classId.message}</p> : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title='Confirm Delete'
        footer={<><Button variant='secondary' onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant='danger' onClick={async () => {
          if (!deleteTarget) return;
          try {
            await deleteStudent.mutateAsync(deleteTarget.id);
            toast.success('Student deleted');
            setDeleteTarget(null);
          } catch {
            toast.error('Delete failed');
          }
        }}>Delete</Button></>}
      >
        Are you sure you want to delete <strong>{deleteName}</strong>?
      </Modal>
    </div>
  );
}
