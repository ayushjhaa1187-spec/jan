'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';
import PassFailChart from '@/components/charts/PassFailChart';
import TopPerformersChart from '@/components/charts/TopPerformersChart';

export default function ReportsPage() {
  const [examId, setExamId] = useState('');
  const exams = useQuery({ queryKey: ['report-exams'], queryFn: async () => (await api.get('/exams')).data.data });
  const charts = useQuery({ queryKey: ['report-charts', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data.data, enabled: Boolean(examId), retry: 0 });

  const downloadBlob = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      toast.error('Download failed');
    }
  };

  return (
    <div className='space-y-6'>
      <Card title='Reports'>
        <select className='rounded-md border px-3 py-2 min-w-80' value={examId} onChange={(event) => setExamId(event.target.value)}>
          <option value=''>Select Exam</option>
          {(exams.data ?? []).map((exam: { id: string; name: string }) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </Card>

      {examId ? (
        <div className='grid md:grid-cols-2 gap-4'>
          <Card title='Grade Distribution'><GradeDistributionChart labels={(charts.data?.gradeDistribution ?? []).map((i: { label: string }) => i.label)} values={(charts.data?.gradeDistribution ?? []).map((i: { value: number }) => i.value)} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f', '#c53030']} /></Card>
          <Card title='Subject Averages'><SubjectAveragesChart labels={(charts.data?.subjectAverages ?? []).map((i: { label: string }) => i.label)} values={(charts.data?.subjectAverages ?? []).map((i: { value: number }) => i.value)} /></Card>
          <Card title='Pass / Fail'><PassFailChart labels={(charts.data?.passFailDistribution ?? []).map((i: { label: string }) => i.label)} values={(charts.data?.passFailDistribution ?? []).map((i: { value: number }) => i.value)} /></Card>
          <Card title='Top Performers'><TopPerformersChart labels={(charts.data?.topPerformers ?? []).map((i: { label: string }) => i.label)} values={(charts.data?.topPerformers ?? []).map((i: { value: number }) => i.value)} /></Card>
        </div>
      ) : null}

      <Card title='Downloads'>
        <div className='flex flex-wrap gap-2'>
          <Button variant='secondary' onClick={() => void downloadBlob(`/reports/report-cards/${examId}`, `report_cards_${examId}.zip`)}>Download All Report Cards ZIP</Button>
          <Button variant='secondary' onClick={() => void downloadBlob(`/reports/class-report/${examId}`, `class_report_${examId}.pdf`)}>Download Class Report PDF</Button>
          <Button variant='secondary' onClick={() => void downloadBlob(`/reports/marksheet/${examId}`, `marksheet_${examId}.pdf`)}>Download Marksheet PDF</Button>
        </div>
      </Card>
    </div>
  );
}
