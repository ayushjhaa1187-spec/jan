'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Exam, ChartData } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import GradeDistributionChart from '@/components/charts/GradeDistributionChart';
import SubjectAveragesChart from '@/components/charts/SubjectAveragesChart';
import PassFailChart from '@/components/charts/PassFailChart';
import TopPerformersChart from '@/components/charts/TopPerformersChart';

export default function ReportsPage() {
  const [examId, setExamId] = useState('');
  const examsQuery = useQuery({ queryKey: ['exams', 'all'], queryFn: async () => (await api.get<{ data: Exam[] }>('/exams', { params: { limit: 100 } })).data.data });
  const chartsQuery = useQuery({
    queryKey: ['reports', 'charts', examId],
    queryFn: async () => (await api.get<{ data: ChartData }>(`/reports/charts/${examId}`)).data.data,
    enabled: Boolean(examId),
  });

  const download = async (url: string, filename: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      const objectUrl = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Download failed');
    }
  };

  const chartData = chartsQuery.data;

  return (
    <div className='space-y-4'>
      <Card title='Reports'>
        <select className='h-10 rounded-md border border-slate-300 px-3' value={examId} onChange={(event) => setExamId(event.target.value)}>
          <option value=''>Select exam</option>
          {(examsQuery.data || []).map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card title='Grade Distribution'>
          <GradeDistributionChart labels={(chartData?.gradeDistribution || []).map((item) => item.label)} values={(chartData?.gradeDistribution || []).map((item) => item.value)} colors={['#1a365d', '#2b6cb0', '#276749', '#b7791f', '#c53030']} />
        </Card>
        <Card title='Subject Averages'>
          <SubjectAveragesChart labels={(chartData?.subjectAverages || []).map((item) => item.label)} values={(chartData?.subjectAverages || []).map((item) => item.value)} />
        </Card>
        <Card title='Pass / Fail'>
          <PassFailChart labels={(chartData?.passFailDistribution || []).map((item) => item.label)} values={(chartData?.passFailDistribution || []).map((item) => item.value)} />
        </Card>
        <Card title='Top Performers'>
          <TopPerformersChart labels={(chartData?.topPerformers || []).map((item) => item.label)} values={(chartData?.topPerformers || []).map((item) => item.value)} />
        </Card>
      </div>

      <Card title='Downloads'>
        <div className='flex flex-wrap gap-2'>
          <Button variant='secondary' onClick={() => void download(`/reports/report-cards/${examId}`, `report_cards_${examId}.zip`)}>Download All Report Cards ZIP</Button>
          <Button variant='secondary' onClick={() => void download(`/reports/class-report/${examId}`, `class_report_${examId}.pdf`)}>Download Class Report PDF</Button>
          <Button variant='secondary' onClick={() => void download(`/reports/marksheet/${examId}`, `marksheet_${examId}.pdf`)}>Download Marksheet PDF</Button>
        </div>
      </Card>
    </div>
  );
}
