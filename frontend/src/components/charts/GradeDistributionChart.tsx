'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  labels: string[];
  values: number[];
  colors: string[];
}

export default function GradeDistributionChart({ labels, values, colors }: Props) {
  const data = labels.map((label, idx) => ({ name: label, value: values[idx] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='45%' outerRadius={90} label={(entry) => `${entry.name}: ${entry.percent ? (entry.percent * 100).toFixed(0) : 0}%`}>
          {data.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index] ?? '#2b6cb0'} />)}
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' />
      </PieChart>
    </ResponsiveContainer>
  );
}
