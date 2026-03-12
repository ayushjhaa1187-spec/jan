'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; section: string; year?: number } | null>(null);
  const [form, setForm] = useState({ name: '', section: 'A', year: new Date().getFullYear().toString(), teacherId: '' });

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data.data });

  const create = useMutation({ mutationFn: async () => api.post('/classes', { name: form.name, section: form.section, year: Number(form.year), teacherId: form.teacherId || undefined }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }) });
  const update = useMutation({ mutationFn: async () => api.put(`/classes/${editing?.id}`, { name: form.name, section: form.section, year: Number(form.year), teacherId: form.teacherId || undefined }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }) });
  const remove = useMutation({ mutationFn: async (id: string) => api.delete(`/classes/${id}`), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }) });

  const submit = async () => {
    try {
      if (editing) {
        await update.mutateAsync();
        toast.success('Class updated');
      } else {
        await create.mutateAsync();
        toast.success('Class created');
      }
      setOpen(false);
      setEditing(null);
    } catch {
      toast.error('Operation failed');
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'><h1 className='text-2xl font-semibold'>Classes</h1><Button onClick={() => { setEditing(null); setOpen(true); }}>Create Class</Button></div>
      <Table columns={[
        { key: 'name', label: 'Class' },
        { key: 'section', label: 'Section' },
        { key: 'year', label: 'Year' },
        { key: 'students', label: 'Students Count', render: (row: { _count?: { students?: number } }) => row._count?.students ?? 0 },
        { key: 'actions', label: 'Actions', render: (row: { id: string; name: string; section: string; year?: number }) => <div className='flex gap-2'><button className='text-slate-700' onClick={() => { setEditing(row); setForm({ name: row.name, section: row.section, year: String(row.year ?? new Date().getFullYear()), teacherId: '' }); setOpen(true); }}>Edit</button><button className='text-red-600' onClick={async () => { try { await remove.mutateAsync(row.id); toast.success('Class deleted'); } catch { toast.error('Delete failed'); } }}>Delete</button></div> },
      ]} data={classes.data ?? []} />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Class' : 'Create Class'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => void submit()}>Save</Button></>}>
        <div className='space-y-3'>
          <Input label='Name' value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label='Section' value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} />
          <Input label='Year' value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
          <Input label='Teacher ID (optional)' value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
