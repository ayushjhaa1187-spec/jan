'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function TopPerformersChart({ labels, values }: { labels: string[]; values: number[] }) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Bar dataKey="value" fill="#1a365d" />
      </BarChart>
    </ResponsiveContainer>
  )
}
