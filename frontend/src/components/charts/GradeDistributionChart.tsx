'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { labels?: string[]; values?: number[]; colors?: string[] }

export function GradeDistributionChart({ labels = ['A', 'B', 'C', 'D', 'F'], values = [30, 25, 20, 15, 10], colors = ['#22c55e', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'] }: Props) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
