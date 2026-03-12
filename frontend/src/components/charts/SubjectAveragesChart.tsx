'use client';

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface SubjectAveragesChartProps {
  labels: string[];
  values: number[];
}

export default function SubjectAveragesChart({ labels, values }: SubjectAveragesChartProps) {
  const data = labels.map((label, index) => ({ subject: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <XAxis dataKey='subject' />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey='value' fill='#2b6cb0' radius={[6, 6, 0, 0]}>
          <LabelList dataKey='value' position='top' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
