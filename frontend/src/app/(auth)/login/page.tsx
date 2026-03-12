'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Login failed')
          : 'Login failed';
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <main className='grid min-h-screen place-items-center bg-[#1a365d] p-4'>
      <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-2xl'>
        <h1 className='text-3xl font-bold text-[#1a365d]'>EduTrack</h1>
        <p className='mt-1 text-sm text-gray-500'>Examination Management System</p>
        <div className='my-6 h-px bg-slate-200' />

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <Input label='Email' placeholder='you@school.com' {...register('email')} error={errors.email?.message} />

          <div className='relative'>
            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter password'
              {...register('password')}
              error={errors.password?.message}
            />
            <button type='button' onClick={() => setShowPassword((value) => !value)} className='absolute right-3 top-8 text-slate-500'>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {serverError ? <p className='text-sm text-red-600'>{serverError}</p> : null}

          <Button type='submit' className='w-full' loading={isSubmitting}>Sign In</Button>
        </form>
      </div>
    </main>
  );
}
