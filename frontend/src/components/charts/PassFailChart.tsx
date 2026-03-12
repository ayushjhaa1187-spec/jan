'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PassFailChartProps {
  labels: string[];
  values: number[];
  colors?: string[];
}

export default function PassFailChart({ labels, values, colors = ['#276749', '#c53030', '#b7791f'] }: PassFailChartProps) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} dataKey='value' outerRadius={95} label>
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index] ?? '#2b6cb0'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' />
      </PieChart>
    </ResponsiveContainer>
  );
}
