'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export function PassFailChart({ labels = [], values = [], colors = [] }: { labels?: string[]; values?: number[]; colors?: string[] }) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] ?? 0, color: colors[i] ?? '#1a365d' }))
  return <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>{data.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
}
