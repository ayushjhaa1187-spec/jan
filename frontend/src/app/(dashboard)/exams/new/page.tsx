'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useCreateExam } from '@/hooks/useExams';
import { Class, Exam } from '@/types';
import { ApiResponse } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const schema = z
  .object({
    name: z.string().min(2),
    classId: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })
  .refine((value) => new Date(value.endDate) > new Date(value.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

export default function NewExamPage() {
  const router = useRouter();
  const createMutation = useCreateExam();
  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', classId: '', startDate: '', endDate: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await createMutation.mutateAsync(values);
      const payload = response.data as ApiResponse<Exam>;
      toast.success('Exam created');
      router.push(`/exams/${payload.data.id}`);
    } catch {
      toast.error('Failed to create exam');
    }
  });

  return (
    <Card title='Create Exam'>
      <form className='grid gap-3 md:grid-cols-2' onSubmit={onSubmit}>
        <Input label='Exam name' error={form.formState.errors.name?.message} {...form.register('name')} />
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700'>Class</label>
          <select className='h-10 w-full rounded-md border border-slate-300 px-3' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classesQuery.data || []).map((item) => (
              <option key={item.id} value={item.id}>{item.name} {item.section}</option>
            ))}
          </select>
        </div>
        <Input label='Start date' type='datetime-local' error={form.formState.errors.startDate?.message} {...form.register('startDate')} />
        <Input label='End date' type='datetime-local' error={form.formState.errors.endDate?.message} {...form.register('endDate')} />
        <div className='md:col-span-2'>
          <Button type='submit' loading={createMutation.isPending}>Create</Button>
        </div>
      </form>
    </Card>
  );
}
