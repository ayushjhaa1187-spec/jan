'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import { useCreateStudent, useDeleteStudent, useStudents, useUpdateStudent } from '@/hooks/useStudents';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).optional().or(z.literal('')),
  classId: z.string().uuid(),
});

type StudentForm = z.infer<typeof schema>;

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<{ id: string; adm_no: string; name: string; email?: string; phone?: string; classId?: string } | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const studentsQuery = useStudents({ page, limit: 20, search, classId: classId || undefined });
  const classesQuery = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn: async () => (await api.get('/classes')).data,
  });

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const createForm = useForm<StudentForm>({ resolver: zodResolver(schema) });
  const editForm = useForm<StudentForm>({ resolver: zodResolver(schema) });

  const classData = classesQuery.data?.data ?? [];

  const onCreate = createForm.handleSubmit(async (values) => {
    try {
      await createStudent.mutateAsync(values);
      toast.success('Student created successfully');
      setOpenCreate(false);
      createForm.reset();
    } catch {
      toast.error('Failed to create student');
    }
  });

  const onEdit = editForm.handleSubmit(async (values) => {
    if (!editing) return;

    try {
      await updateStudent.mutateAsync({ id: editing.id, payload: values });
      toast.success('Student updated successfully');
      setEditing(null);
      editForm.reset();
    } catch {
      toast.error('Failed to update student');
    }
  });

  const rows = studentsQuery.data?.data ?? [];
  const meta = studentsQuery.data?.meta;

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <h1 className='text-2xl font-semibold'>Students</h1>
        <Button onClick={() => setOpenCreate(true)}>Add Student</Button>
      </div>

      <div className='grid md:grid-cols-3 gap-3'>
        <Input placeholder='Search by name or admission number' value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        <select className='rounded-md border px-3 py-2' value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value=''>All classes</option>
          {classData.map((item) => (
            <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
          ))}
        </select>
      </div>

      <Table
        loading={studentsQuery.isLoading}
        columns={[
          { key: 'adm_no', label: 'Adm No' },
          { key: 'name', label: 'Name' },
          { key: 'class', label: 'Class-Section', render: (row: { class?: { name?: string; section?: string } }) => `${row.class?.name ?? '-'}-${row.class?.section ?? '-'}` },
          {
            key: 'actions',
            label: 'Actions',
            render: (row: { id: string; adm_no: string; name: string; email?: string; phone?: string; class?: { id?: string } }) => (
              <div className='flex gap-2'>
                <Link className='text-blue-700' href={`/students/${row.id}`}>View</Link>
                <button
                  className='text-slate-700'
                  onClick={() => {
                    setEditing({ id: row.id, adm_no: row.adm_no, name: row.name, email: row.email, phone: row.phone, classId: row.class?.id });
                    editForm.reset({ adm_no: row.adm_no, name: row.name, email: row.email ?? '', phone: row.phone ?? '', classId: row.class?.id ?? '' });
                  }}
                >
                  Edit
                </button>
                <button className='text-red-600' onClick={() => setDeleting({ id: row.id, name: row.name })}>Delete</button>
              </div>
            ),
          },
        ]}
        data={rows}
      />

      <Pagination page={meta?.page ?? page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title='Create Student'
        footer={
          <>
            <Button variant='secondary' onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button loading={createStudent.isPending} onClick={onCreate}>Create</Button>
          </>
        }
      >
        <form className='space-y-3'>
          <Input label='Admission No' {...createForm.register('adm_no')} error={createForm.formState.errors.adm_no?.message} />
          <Input label='Name' {...createForm.register('name')} error={createForm.formState.errors.name?.message} />
          <Input label='Email' {...createForm.register('email')} error={createForm.formState.errors.email?.message} />
          <Input label='Phone' {...createForm.register('phone')} error={createForm.formState.errors.phone?.message} />
          <Input label='Class ID' {...createForm.register('classId')} error={createForm.formState.errors.classId?.message} />
        </form>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title='Edit Student'
        footer={
          <>
            <Button variant='secondary' onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={updateStudent.isPending} onClick={onEdit}>Save</Button>
          </>
        }
      >
        <form className='space-y-3'>
          <Input label='Admission No' {...editForm.register('adm_no')} error={editForm.formState.errors.adm_no?.message} />
          <Input label='Name' {...editForm.register('name')} error={editForm.formState.errors.name?.message} />
          <Input label='Email' {...editForm.register('email')} error={editForm.formState.errors.email?.message} />
          <Input label='Phone' {...editForm.register('phone')} error={editForm.formState.errors.phone?.message} />
          <Input label='Class ID' {...editForm.register('classId')} error={editForm.formState.errors.classId?.message} />
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title='Delete Student'
        footer={
          <>
            <Button variant='secondary' onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant='danger'
              loading={deleteStudent.isPending}
              onClick={async () => {
                if (!deleting) return;
                try {
                  await deleteStudent.mutateAsync(deleting.id);
                  toast.success('Student deleted');
                  setDeleting(null);
                } catch {
                  toast.error('Delete failed');
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete <strong>{deleting?.name}</strong>?</p>
      </Modal>
    </div>
  );
}
