'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';
import PassFailChart from '@/components/charts/PassFailChart';
import TopPerformersChart from '@/components/charts/TopPerformersChart';
import { downloadBlob } from '@/lib/utils';

export default function ReportsPage() {
  const [examId, setExamId] = useState('');
  const exams = useQuery({ queryKey: ['exams', 'reports'], queryFn: async () => (await api.get('/exams?limit=200')).data.data.data });
  const charts = useQuery({ queryKey: ['reports', 'charts', examId], queryFn: async () => (await api.get(`/reports/charts/${examId}`)).data.data, enabled: Boolean(examId), retry: 0 });

  const chartData = charts.data ?? {
    gradeDistribution: [{ label: 'A', value: 10 }, { label: 'B', value: 12 }, { label: 'C', value: 8 }],
    subjectAverages: [{ label: 'Math', value: 80 }, { label: 'Science', value: 75 }],
    passFailDistribution: [{ label: 'Pass', value: 35 }, { label: 'Fail', value: 7 }, { label: 'Incomplete', value: 2 }],
    topPerformers: [{ label: 'Amit', value: 92 }, { label: 'Neha', value: 90 }],
  };

  return (
    <div className='space-y-4'>
      <Card title='Reports'>
        <div className='max-w-sm space-y-1'>
          <label className='text-sm font-medium'>Select Exam</label>
          <select value={examId} onChange={(event) => setExamId(event.target.value)} className='h-10 w-full rounded border border-slate-300 px-3'>
            <option value=''>Choose exam</option>
            {(exams.data ?? []).map((exam: { id: string; name: string }) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </select>
        </div>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card title='Grade Distribution'><GradeDistributionChart labels={chartData.gradeDistribution.map((x: { label: string }) => x.label)} values={chartData.gradeDistribution.map((x: { value: number }) => x.value)} colors={['#1a365d', '#2b6cb0', '#63b3ed', '#90cdf4']} /></Card>
        <Card title='Subject Averages'><SubjectAveragesChart labels={chartData.subjectAverages.map((x: { label: string }) => x.label)} values={chartData.subjectAverages.map((x: { value: number }) => x.value)} /></Card>
        <Card title='Pass / Fail'><PassFailChart labels={chartData.passFailDistribution.map((x: { label: string }) => x.label)} values={chartData.passFailDistribution.map((x: { value: number }) => x.value)} /></Card>
        <Card title='Top Performers'><TopPerformersChart labels={chartData.topPerformers.map((x: { label: string }) => x.label)} values={chartData.topPerformers.map((x: { value: number }) => x.value)} /></Card>
      </div>

      {examId ? (
        <Card title='Downloads'>
          <div className='flex flex-wrap gap-2'>
            <Button variant='secondary' onClick={async () => downloadBlob((await api.get(`/reports/report-cards/${examId}`, { responseType: 'blob' })).data, `report_cards_${examId}.zip`)}>Download All Report Cards ZIP</Button>
            <Button variant='secondary' onClick={async () => downloadBlob((await api.get(`/reports/class-report/${examId}`, { responseType: 'blob' })).data, `class_report_${examId}.pdf`)}>Download Class Report PDF</Button>
            <Button variant='secondary' onClick={async () => downloadBlob((await api.get(`/reports/marksheet/${examId}`, { responseType: 'blob' })).data, `marksheet_${examId}.pdf`)}>Download Marksheet PDF</Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
