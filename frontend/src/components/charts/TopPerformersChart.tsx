'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TopPerformersChartProps {
  labels: string[];
  values: number[];
}

export default function TopPerformersChart({ labels, values }: TopPerformersChartProps) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} layout='vertical' margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <XAxis type='number' domain={[0, 100]} />
        <YAxis dataKey='name' type='category' width={120} />
        <Tooltip />
        <Bar dataKey='value' fill='#1a365d' radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
