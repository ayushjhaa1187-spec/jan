'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCreateExam } from '@/hooks/useExams';
import api from '@/lib/api';

const schema = z.object({ name: z.string().min(2), classId: z.string().uuid(), startDate: z.string().min(1), endDate: z.string().min(1) }).refine((data) => new Date(data.endDate) > new Date(data.startDate), { message: 'End date must be after start date', path: ['endDate'] });
type FormValues = z.infer<typeof schema>;

export default function NewExamPage() {
  const router = useRouter();
  const createExam = useCreateExam();
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <Card title='Create Exam'>
      <form className='grid gap-3 md:grid-cols-2' onSubmit={handleSubmit(async (values) => {
        try {
          const response = await createExam.mutateAsync(values as unknown as Record<string, unknown>);
          const examId = response.data?.id ?? response.id;
          toast.success('Exam created');
          if (examId) router.push(`/exams/${examId}`);
          else router.push('/exams');
        } catch {
          toast.error('Failed to create exam');
        }
      })}>
        <Input label='Exam name' {...register('name')} error={errors.name?.message} />
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Class</label>
          <select className='h-10 w-full rounded border border-slate-300 px-3' {...register('classId')}>
            <option value=''>Select class</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
          </select>
          {errors.classId ? <p className='text-xs text-red-600'>{errors.classId.message}</p> : null}
        </div>
        <Input label='Start date' type='datetime-local' {...register('startDate')} error={errors.startDate?.message} />
        <Input label='End date' type='datetime-local' {...register('endDate')} error={errors.endDate?.message} />
        <div className='md:col-span-2'>
          <Button loading={isSubmitting}>Create Exam</Button>
        </div>
      </form>
    </Card>
  );
}
