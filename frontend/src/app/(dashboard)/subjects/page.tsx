'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

const schema = z.object({ name: z.string().min(2), code: z.string().min(2), maxMarks: z.coerce.number().min(1).max(1000).default(100) });
type FormValues = z.infer<typeof schema>;

export default function SubjectsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; code: string; maxMarks?: number } | null>(null);
  const qc = useQueryClient();
  const subjects = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects?limit=200')).data.data.data ?? (await api.get('/subjects')).data.data });
  const save = useMutation({ mutationFn: async ({ id, payload }: { id?: string; payload: FormValues }) => (id ? api.put(`/subjects/${id}`, payload) : api.post('/subjects', payload)), onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }) });
  const remove = useMutation({ mutationFn: async (id: string) => api.delete(`/subjects/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['subjects'] }) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return <div className='space-y-4'>
    <div className='flex justify-end'><Button onClick={() => { setEditing(null); reset({ name: '', code: '', maxMarks: 100 }); setOpen(true); }}>Create Subject</Button></div>
    <Table data={subjects.data ?? []} loading={subjects.isLoading} columns={[
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'maxMarks', label: 'Max Marks', render: (row) => String(row.maxMarks ?? 100) },
      { key: 'actions', label: 'Actions', render: (row) => <div className='flex gap-2'><Button size='sm' variant='secondary' onClick={() => { setEditing(row); reset({ name: row.name, code: row.code, maxMarks: row.maxMarks ?? 100 }); setOpen(true); }}>Edit</Button><Button size='sm' variant='danger' onClick={async () => { try { await remove.mutateAsync(row.id); toast.success('Deleted'); } catch { toast.error('Delete failed. Subject may be in use.'); } }}>Delete</Button></div> },
    ]} />

    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Subject' : 'Create Subject'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit(async (values) => { try { await save.mutateAsync({ id: editing?.id, payload: values }); toast.success('Saved'); setOpen(false); } catch { toast.error('Save failed'); } })}>Save</Button></>}>
      <div className='grid gap-3'>
        <div><label className='text-sm font-medium'>Name</label><input className='mt-1 h-10 w-full rounded border px-3' {...register('name')} />{errors.name ? <p className='text-xs text-red-600'>{errors.name.message}</p> : null}</div>
        <div><label className='text-sm font-medium'>Code</label><input className='mt-1 h-10 w-full rounded border px-3' {...register('code')} />{errors.code ? <p className='text-xs text-red-600'>{errors.code.message}</p> : null}</div>
        <div><label className='text-sm font-medium'>Max Marks</label><input type='number' className='mt-1 h-10 w-full rounded border px-3' {...register('maxMarks')} /></div>
      </div>
    </Modal>
  </div>;
}
