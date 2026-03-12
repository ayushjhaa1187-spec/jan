'use client';

import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCreateStudent } from '@/hooks/useStudents';
import api from '@/lib/api';

const schema = z.object({ adm_no: z.string().min(1), name: z.string().min(2), email: z.string().email().optional().or(z.literal('')), phone: z.string().optional(), classId: z.string().uuid() });

type FormValues = z.infer<typeof schema>;

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes?limit=200')).data.data.data });
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await createStudent.mutateAsync(values);
      toast.success('Student created');
      router.push('/students');
    } catch {
      toast.error('Create failed');
    }
  };

  return (
    <Card title='Add Student'>
      <form className='grid gap-3 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
        <Input label='Admission Number' {...register('adm_no')} error={errors.adm_no?.message} />
        <Input label='Name' {...register('name')} error={errors.name?.message} />
        <Input label='Email' {...register('email')} error={errors.email?.message} />
        <Input label='Phone' {...register('phone')} error={errors.phone?.message} />
        <div className='space-y-1 md:col-span-2'>
          <label className='text-sm font-medium'>Class</label>
          <select className='h-10 w-full rounded border border-slate-300 px-3' {...register('classId')}>
            <option value=''>Select class</option>
            {(classes.data ?? []).map((item: { id: string; name: string; section: string }) => <option key={item.id} value={item.id}>{item.name} - {item.section}</option>)}
          </select>
          {errors.classId ? <p className='text-xs text-red-600'>{errors.classId.message}</p> : null}
        </div>
        <div className='md:col-span-2'>
          <Button loading={isSubmitting}>Create Student</Button>
        </div>
      </form>
    </Card>
  );
}
