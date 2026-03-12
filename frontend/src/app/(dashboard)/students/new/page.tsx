'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useCreateStudent } from '@/hooks/useStudents';

const schema = z.object({
  adm_no: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  classId: z.string().uuid(),
});

type FormValues = z.infer<typeof schema>;

export default function NewStudentPage() {
  const router = useRouter();
  const createStudent = useCreateStudent();
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createStudent.mutateAsync(values);
      toast.success('Student created successfully');
      router.push('/students');
    } catch {
      toast.error('Failed to create student');
    }
  });

  return (
    <Card title='Create Student'>
      <form className='grid md:grid-cols-2 gap-4' onSubmit={onSubmit}>
        <Input label='Admission No' {...form.register('adm_no')} error={form.formState.errors.adm_no?.message} />
        <Input label='Name' {...form.register('name')} error={form.formState.errors.name?.message} />
        <Input label='Email' {...form.register('email')} error={form.formState.errors.email?.message} />
        <Input label='Phone' {...form.register('phone')} error={form.formState.errors.phone?.message} />
        <Input label='Class ID' {...form.register('classId')} error={form.formState.errors.classId?.message} />
        <div className='md:col-span-2'>
          <Button loading={createStudent.isPending} type='submit'>Create Student</Button>
        </div>
      </form>
    </Card>
  );
}
