'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ApiResponse, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof schema>;

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError('');
      const response = await api.post<ApiResponse<LoginData>>('/auth/login', values);
      const payload = response.data.data;

      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      setUser(payload.user);

      toast.success('Login successful');
      router.push('/dashboard');
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error ? submitError.message : 'Login failed';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <main className='grid min-h-screen place-items-center bg-[#1a365d] p-4'>
      <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-2xl'>
        <h1 className='text-center text-3xl font-bold text-[#1a365d]'>EduTrack</h1>
        <p className='mt-2 text-center text-sm text-slate-500'>Examination Management System</p>
        <hr className='my-6 border-slate-200' />

        <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <Input label='Email' type='email' placeholder='admin@school.com' error={errors.email?.message} {...register('email')} />

          <div className='space-y-1'>
            <Input
              label='Password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type='button'
              className='flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700'
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />} {showPassword ? 'Hide' : 'Show'} password
            </button>
          </div>

          {error ? <p className='text-sm text-danger'>{error}</p> : null}

          <Button type='submit' className='w-full' loading={isSubmitting}>
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}
