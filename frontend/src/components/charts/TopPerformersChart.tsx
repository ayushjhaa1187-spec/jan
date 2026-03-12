'use client';

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface Props {
  labels: string[];
  values: number[];
}

export default function TopPerformersChart({ labels, values }: Props) {
  const data = labels.map((label, idx) => ({ name: label, value: values[idx] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} layout='vertical'>
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
