'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export function GradeDistributionChart({ labels, values, colors }: { labels: string[]; values: number[]; colors: string[] }) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0, color: colors[index] ?? '#2b6cb0' }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
