'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function ResultsPage() {
  const router = useRouter();
  const exams = useQuery({ queryKey: ['results-exams'], queryFn: async () => (await api.get('/exams')).data.data });

  return (
    <Card title='Results'>
      <div className='space-y-2'>
        {(exams.data ?? []).map((exam: { id: string; name: string; status: string }) => (
          <div key={exam.id} className='flex items-center justify-between rounded border px-3 py-2'>
            <div>
              <p className='font-medium'>{exam.name}</p>
              <p className='text-xs text-slate-500'>{exam.status}</p>
            </div>
            <Button variant='secondary' onClick={() => router.push(`/results/${exam.id}`)}>View Results</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
