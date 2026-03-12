'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useState } from 'react';
import api from '@/lib/api';

const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000).max(2100) });
type FormValues = z.infer<typeof schema>;

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const qc = useQueryClient();
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });
  const save = useMutation({ mutationFn: async ({ id, payload }: { id?: string; payload: FormValues }) => (id ? api.put(`/classes/${id}`, payload) : api.post('/classes', payload)), onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }) });
  const remove = useMutation({ mutationFn: async (id: string) => api.delete(`/classes/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }) });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'><Button onClick={() => { setEditingId(null); reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true); }}>Create Class</Button></div>
      <Table
        data={classes.data ?? []}
        loading={classes.isLoading}
        columns={[
          { key: 'name', label: 'Class' },
          { key: 'section', label: 'Section' },
          { key: 'year', label: 'Year', render: (row) => String(row.year ?? '-') },
          { key: 'students', label: 'Students', render: (row) => String(row._count?.students ?? 0) },
          { key: 'actions', label: 'Actions', render: (row) => <div className='flex gap-2'><Button size='sm' variant='secondary' onClick={() => { setEditingId(row.id); reset({ name: row.name, section: row.section, year: row.year ?? new Date().getFullYear() }); setOpen(true); }}>Edit</Button><Button size='sm' variant='danger' onClick={async () => { try { await remove.mutateAsync(row.id); toast.success('Class deleted'); } catch { toast.error('Delete failed'); } }}>Delete</Button></div> },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Class' : 'Create Class'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit(async (values) => { try { await save.mutateAsync({ id: editingId ?? undefined, payload: values }); toast.success('Saved'); setOpen(false); } catch { toast.error('Save failed'); } })}>Save</Button></>}>
        <div className='grid gap-3'>
          <input className='hidden' readOnly value={editingId ?? ''} />
          <div><label className='text-sm font-medium'>Name</label><input className='mt-1 h-10 w-full rounded border px-3' {...register('name')} />{errors.name ? <p className='text-xs text-red-600'>{errors.name.message}</p> : null}</div>
          <div><label className='text-sm font-medium'>Section</label><input className='mt-1 h-10 w-full rounded border px-3' {...register('section')} />{errors.section ? <p className='text-xs text-red-600'>{errors.section.message}</p> : null}</div>
          <div><label className='text-sm font-medium'>Year</label><input type='number' className='mt-1 h-10 w-full rounded border px-3' {...register('year')} />{errors.year ? <p className='text-xs text-red-600'>{errors.year.message}</p> : null}</div>
        </div>
      </Modal>
    </div>
  );
}
