'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Subject } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

const subjectSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  maxMarks: z.number().int().min(1).max(200).default(100),
});

type SubjectForm = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const queryClient = useQueryClient();

  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get<{ data: Subject[] }>('/subjects')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: SubjectForm) => api.post('/subjects', payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<SubjectForm> }) => api.put(`/subjects/${id}`, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/subjects/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const form = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: '', code: '', maxMarks: 100 },
  });

  const close = () => {
    setOpen(false);
    setEditTarget(null);
    form.reset({ name: '', code: '', maxMarks: 100 });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, payload: values });
        toast.success('Subject updated');
      } else {
        await createMutation.mutateAsync(values);
        toast.success('Subject created');
      }
      close();
    } catch {
      toast.error('Operation failed');
    }
  });

  return (
    <Card title='Subjects' actions={<Button onClick={() => setOpen(true)}>Add Subject</Button>}>
      <Table
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'code', label: 'Code' },
          { key: 'maxMarks', label: 'Max Marks', render: (row: Subject) => row.maxMarks ?? 100 },
          {
            key: 'actions',
            label: 'Actions',
            render: (row: Subject) => (
              <div className='flex gap-2'>
                <Button size='sm' variant='secondary' onClick={() => { setEditTarget(row); setOpen(true); form.reset({ name: row.name, code: row.code, maxMarks: row.maxMarks ?? 100 }); }}>Edit</Button>
                <Button size='sm' variant='danger' onClick={async () => {
                  try {
                    await deleteMutation.mutateAsync(row.id);
                    toast.success('Subject deleted');
                  } catch {
                    toast.error('Unable to delete subject');
                  }
                }}>Delete</Button>
              </div>
            ),
          },
        ]}
        data={subjectsQuery.data || []}
      />

      <Modal
        open={open}
        onClose={close}
        title={editTarget ? 'Edit Subject' : 'Create Subject'}
        footer={<><Button variant='secondary' onClick={close}>Cancel</Button><Button onClick={submit}>Save</Button></>}
      >
        <form className='space-y-3'>
          <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label='Code' {...form.register('code')} error={form.formState.errors.code?.message} />
          <Input label='Max Marks' type='number' {...form.register('maxMarks', { valueAsNumber: true })} error={form.formState.errors.maxMarks?.message} />
        </form>
      </Modal>
    </Card>
  );
}
