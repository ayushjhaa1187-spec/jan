'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props { labels?: string[]; values?: number[] }

export function TopPerformersChart({ labels = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'], values = [95, 92, 88, 85, 82] }: Props) {
  const data = labels.map((label, i) => ({ name: label, percentage: values[i] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data} margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
        <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
        <Bar dataKey="percentage" fill="#1a365d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
