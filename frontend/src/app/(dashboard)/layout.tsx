'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { CenteredSpinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, setLoading, setUser } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/auth/me')
      .then((response) => {
        setUser(response.data.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/login');
      });
  }, [router, setLoading, setUser]);

  if (isLoading) {
    return <CenteredSpinner />;
  }

  return (
    <div className='flex h-screen bg-[#f7fafc]'>
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        <Header onMenuToggle={() => setMobileOpen((value) => !value)} />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
