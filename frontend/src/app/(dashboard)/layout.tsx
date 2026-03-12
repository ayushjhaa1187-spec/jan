'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CenteredSpinner } from '@/components/ui/Spinner';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, setLoading, isLoading } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.data);
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

  const title = pathname.split('/')[1] || 'dashboard';

  return (
    <div className='flex h-screen bg-[#f7fafc]'>
      <Sidebar isMobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        <Header title={title.charAt(0).toUpperCase() + title.slice(1)} onMenuToggle={() => setMobileOpen((v) => !v)} />
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
