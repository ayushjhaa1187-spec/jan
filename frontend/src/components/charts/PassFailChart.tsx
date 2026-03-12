'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Props { labels?: string[]; values?: number[]; colors?: string[] }

export function PassFailChart({ labels = ['Pass', 'Fail'], values = [75, 25], colors = ['#22c55e', '#ef4444'] }: Props) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
