'use client';

import { useRouter } from 'next/navigation';
import { useExams } from '@/hooks/useExams';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Exam } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const examsQuery = useExams({ page: 1, limit: 100 });

  return (
    <Card title='Results'>
      <div className='space-y-2'>
        {(examsQuery.data?.data || []).map((exam: Exam) => (
          <div key={exam.id} className='flex items-center justify-between rounded border border-slate-200 p-3'>
            <div>
              <p className='font-medium'>{exam.name}</p>
              <p className='text-sm text-slate-500'>{exam.class?.name} {exam.class?.section}</p>
            </div>
            <Button variant='secondary' onClick={() => router.push(`/results/${exam.id}`)}>View Results</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
