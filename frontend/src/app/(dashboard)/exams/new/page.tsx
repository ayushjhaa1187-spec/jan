'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useCreateExam } from '@/hooks/useExams';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z
  .object({
    name: z.string().min(2),
    classId: z.string().uuid(),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })
  .refine((value) => new Date(value.endDate).getTime() > new Date(value.startDate).getTime(), {
    path: ['endDate'],
    message: 'End date must be after start date',
  });

type FormValues = z.infer<typeof schema>;

export default function NewExamPage() {
  const router = useRouter();
  const createExam = useCreateExam();
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data.data });
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await createExam.mutateAsync(values);
      toast.success('Exam created successfully');
      router.push(`/exams/${response.data.id}`);
    } catch {
      toast.error('Failed to create exam');
    }
  });

  return (
    <Card title='Create Exam'>
      <form className='grid md:grid-cols-2 gap-4' onSubmit={onSubmit}>
        <Input label='Exam Name' {...form.register('name')} error={form.formState.errors.name?.message} />
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Class</label>
          <select className='w-full rounded-md border px-3 py-2' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => (
              <option key={item.id} value={item.id}>{item.name} - {item.section}</option>
            ))}
          </select>
          {form.formState.errors.classId ? <p className='text-xs text-red-600'>{form.formState.errors.classId.message}</p> : null}
        </div>
        <Input type='datetime-local' label='Start Date' {...form.register('startDate')} error={form.formState.errors.startDate?.message} />
        <Input type='datetime-local' label='End Date' {...form.register('endDate')} error={form.formState.errors.endDate?.message} />
        <div className='md:col-span-2'>
          <Button loading={createExam.isPending} type='submit'>Create Exam</Button>
        </div>
      </form>
    </Card>
  );
}
