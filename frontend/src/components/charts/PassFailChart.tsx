'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  labels: string[];
  values: number[];
  colors?: string[];
}

const defaultColors = ['#276749', '#c53030', '#b7791f'];

export default function PassFailChart({ labels, values, colors = defaultColors }: Props) {
  const data = labels.map((label, idx) => ({ name: label, value: values[idx] ?? 0 }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={100}>
          {data.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={colors[index] ?? defaultColors[index % defaultColors.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
