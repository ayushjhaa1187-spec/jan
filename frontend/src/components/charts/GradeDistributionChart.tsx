'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface GradeDistributionChartProps {
  labels: string[];
  values: number[];
  colors: string[];
}

export default function GradeDistributionChart({ labels, values, colors }: GradeDistributionChartProps) {
  const data = labels.map((label, index) => ({
    name: label,
    value: values[index] ?? 0,
  }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} cx='50%' cy='45%' outerRadius={90} dataKey='value' label={(entry) => `${entry.name} ${(entry.percent * 100).toFixed(1)}%`}>
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
