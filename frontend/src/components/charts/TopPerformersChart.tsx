'use client';

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TopPerformersChartProps {
  labels: string[];
  values: number[];
}

export default function TopPerformersChart({ labels, values }: TopPerformersChartProps) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart layout='vertical' data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis type='number' domain={[0, 100]} />
        <YAxis type='category' dataKey='name' width={120} />
        <Tooltip />
        <Bar dataKey='value' fill='#1a365d'>
          <LabelList dataKey='value' position='right' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
