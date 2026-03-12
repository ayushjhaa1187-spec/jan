'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface GradeDistributionChartProps {
  labels: string[];
  values: number[];
  colors: string[];
}

export default function GradeDistributionChart({ labels, values, colors }: GradeDistributionChartProps) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey='value'
          nameKey='name'
          cx='50%'
          cy='45%'
          outerRadius={90}
          label={(entry) => `${entry.name}: ${entry.value}`}
        >
          {data.map((item, index) => (
            <Cell key={item.name} fill={colors[index] || '#2b6cb0'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' />
      </PieChart>
    </ResponsiveContainer>
  );
}
