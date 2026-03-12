'use client';

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SubjectAveragesChartProps {
  labels: string[];
  values: number[];
}

export default function SubjectAveragesChart({ labels, values }: SubjectAveragesChartProps) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey='value' fill='#2b6cb0'>
          <LabelList dataKey='value' position='top' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
