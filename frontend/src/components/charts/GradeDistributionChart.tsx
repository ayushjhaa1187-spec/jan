'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function GradeDistributionChart({ labels = [], values = [], colors = [] }: { labels?: string[]; values?: number[]; colors?: string[] }) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] ?? 0, color: colors[i] ?? '#2b6cb0' }))
  return <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>{data.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
}
