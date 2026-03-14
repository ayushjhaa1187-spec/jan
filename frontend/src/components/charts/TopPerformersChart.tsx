'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function TopPerformersChart({ labels, values }: { labels: string[]; values: number[] }) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={120} />
        <Tooltip />
        <Bar dataKey="value" fill="#1a365d" />
      </BarChart>
    </ResponsiveContainer>
  )
}
