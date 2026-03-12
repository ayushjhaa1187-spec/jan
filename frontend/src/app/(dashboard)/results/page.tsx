'use client';

import { useRouter } from 'next/navigation';
import { useExams } from '@/hooks/useExams';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function ResultsPage() {
  const router = useRouter();
  const exams = useExams({ limit: 100, page: 1 });

  return (
    <Card title='Results'>
      <div className='space-y-3'>
        {(exams.data?.data ?? []).map((exam) => (
          <div key={exam.id} className='flex items-center justify-between rounded border p-3'>
            <div>
              <p className='font-medium'>{exam.name}</p>
              <p className='text-sm text-slate-500'>{exam.class?.name} - {exam.class?.section}</p>
            </div>
            <Button onClick={() => router.push(`/results/${exam.id}`)}>View Results</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
