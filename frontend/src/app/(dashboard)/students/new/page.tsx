'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCreateStudent } from '@/hooks/useStudents';
import { Class } from '@/types';

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  classId: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function NewStudentPage() {
  const router = useRouter();
  const createMutation = useCreateStudent();
  const classesQuery = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get<{ data: Class[] }>('/classes')).data.data });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { adm_no: '', name: '', email: '', phone: '', classId: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Student created');
      router.push('/students');
    } catch {
      toast.error('Failed to create student');
    }
  });

  return (
    <Card title='Create Student'>
      <form className='grid gap-3 md:grid-cols-2' onSubmit={onSubmit}>
        <Input label='Admission No' error={form.formState.errors.adm_no?.message} {...form.register('adm_no')} />
        <Input label='Name' error={form.formState.errors.name?.message} {...form.register('name')} />
        <Input label='Email' error={form.formState.errors.email?.message} {...form.register('email')} />
        <Input label='Phone' {...form.register('phone')} />
        <div>
          <label className='mb-1 block text-sm font-medium text-slate-700'>Class</label>
          <select className='h-10 w-full rounded-md border border-slate-300 px-3' {...form.register('classId')}>
            <option value=''>Select class</option>
            {(classesQuery.data || []).map((item) => (
              <option key={item.id} value={item.id}>{item.name} {item.section}</option>
            ))}
          </select>
        </div>
        <div className='md:col-span-2'>
          <Button loading={createMutation.isPending} type='submit'>Create Student</Button>
        </div>
      </form>
    </Card>
  );
}
