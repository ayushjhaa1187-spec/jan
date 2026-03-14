'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export function GradeDistributionChart({ labels, values, colors }: { labels: string[]; values: number[]; colors: string[] }) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0, color: colors[index] ?? '#1a365d' }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
