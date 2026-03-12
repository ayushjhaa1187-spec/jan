'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ name: '', code: '', maxMarks: '100' });

  const subjects = useQuery({ queryKey: ['subjects'], queryFn: async () => (await api.get('/subjects')).data.data });
  const create = useMutation({ mutationFn: async () => api.post('/subjects', { name: form.name, code: form.code, maxMarks: Number(form.maxMarks) }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }) });
  const update = useMutation({ mutationFn: async () => api.put(`/subjects/${editingId}`, { name: form.name, code: form.code, maxMarks: Number(form.maxMarks) }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }) });
  const remove = useMutation({ mutationFn: async (id: string) => api.delete(`/subjects/${id}`), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }) });

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'><h1 className='text-2xl font-semibold'>Subjects</h1><Button onClick={() => { setEditingId(''); setForm({ name: '', code: '', maxMarks: '100' }); setOpen(true); }}>Create Subject</Button></div>
      <Table columns={[
        { key: 'name', label: 'Name' },
        { key: 'code', label: 'Code' },
        { key: 'maxMarks', label: 'Max Marks' },
        { key: 'actions', label: 'Actions', render: (row: { id: string; name: string; code: string; maxMarks?: number }) => <div className='flex gap-2'><button onClick={() => { setEditingId(row.id); setForm({ name: row.name, code: row.code, maxMarks: String(row.maxMarks ?? 100) }); setOpen(true); }} className='text-slate-700'>Edit</button><button onClick={async () => { try { await remove.mutateAsync(row.id); toast.success('Subject deleted'); } catch { toast.error('Unable to delete subject'); } }} className='text-red-600'>Delete</button></div> },
      ]} data={subjects.data ?? []} />
      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit Subject' : 'Create Subject'} footer={<><Button variant='secondary' onClick={() => setOpen(false)}>Cancel</Button><Button onClick={async () => { try { if (editingId) { await update.mutateAsync(); toast.success('Subject updated'); } else { await create.mutateAsync(); toast.success('Subject created'); } setOpen(false); } catch { toast.error('Save failed'); } }}>Save</Button></>}>
        <div className='space-y-3'>
          <Input label='Name' value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label='Code' value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          <Input label='Max Marks' value={form.maxMarks} onChange={(event) => setForm({ ...form, maxMarks: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
