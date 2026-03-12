'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof schema>;

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      permissions: string[];
    };
  };
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginForm) => {
    setFormError('');
    try {
      const response = await api.post<LoginResponse>('/auth/login', values);
      const payload = response.data.data;
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      setUser(payload.user);
      setLoading(false);
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed'
          : 'Login failed';
      setFormError(message);
      toast.error(message);
    }
  };

  return (
    <main className='min-h-screen bg-[#1a365d] grid place-items-center p-4'>
      <div className='w-full max-w-md rounded-xl bg-white shadow-2xl p-8'>
        <h1 className='text-3xl font-bold text-[#1a365d] text-center'>EduTrack</h1>
        <p className='text-center text-gray-500 mt-1'>Examination Management System</p>
        <div className='my-5 border-t' />

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <Input label='Email' placeholder='you@school.com' {...register('email')} error={errors.email?.message} />

          <div className='space-y-1'>
            <label className='text-sm font-medium text-slate-700'>Password</label>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                className='pr-10'
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type='button'
                className='absolute right-2 top-2.5 text-slate-500'
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {formError ? <p className='text-sm text-red-600'>{formError}</p> : null}

          <Button loading={isSubmitting} className='w-full' type='submit'>
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}
