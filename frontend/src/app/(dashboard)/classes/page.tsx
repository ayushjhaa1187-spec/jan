'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Class } from '@/types';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

const classSchema = z.object({
  name: z.string().min(1),
  section: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
});

type ClassForm = z.infer<typeof classSchema>;

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Class | null>(null);
  const queryClient = useQueryClient();

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ClassForm) => api.post('/classes', payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ClassForm> }) => api.put(`/classes/${id}`, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });

  const form = useForm<ClassForm>({
    resolver: zodResolver(classSchema),
    defaultValues: { name: '', section: '', year: new Date().getFullYear() },
  });

  const close = () => {
    setOpen(false);
    setEditTarget(null);
    form.reset({ name: '', section: '', year: new Date().getFullYear() });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, payload: values });
        toast.success('Class updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Class created');
      }
      close();
    } catch {
      toast.error('Operation failed');
    }
  });

  return (
    <Card title='Classes' actions={<Button onClick={() => setOpen(true)}>Create Class</Button>}>
      <Table
        columns={[
          { key: 'name', label: 'Class' },
          { key: 'section', label: 'Section' },
          { key: 'year', label: 'Year' },
          { key: '_count', label: 'Students', render: (row: Class) => row._count?.students ?? 0 },
          {
            key: 'actions',
            label: 'Actions',
            render: (row: Class) => (
              <div className='flex gap-2'>
                <Button size='sm' variant='secondary' onClick={() => { setEditTarget(row); setOpen(true); form.reset({ name: row.name, section: row.section, year: row.year || new Date().getFullYear() }); }}>Edit</Button>
                <Button size='sm' variant='danger' onClick={async () => { try { await deleteMutation.mutateAsync(row.id); toast.success('Class deleted'); } catch { toast.error('Delete failed'); } }}>Delete</Button>
              </div>
            ),
          },
        ]}
        data={classesQuery.data || []}
      />

      <Modal
        open={open}
        onClose={close}
        title={editTarget ? 'Edit Class' : 'Create Class'}
        footer={<><Button variant='secondary' onClick={close}>Cancel</Button><Button onClick={submit}>Save</Button></>}
      >
        <form className='space-y-3'>
          <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label='Section' {...form.register('section')} error={form.formState.errors.section?.message} />
          <Input label='Year' type='number' {...form.register('year', { valueAsNumber: true })} error={form.formState.errors.year?.message} />
        </form>
      </Modal>
    </Card>
  );
}
