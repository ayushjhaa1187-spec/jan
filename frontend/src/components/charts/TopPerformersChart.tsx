'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export function TopPerformersChart({ labels = [], values = [] }: { labels?: string[]; values?: number[] }) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] ?? 0 }))
  return <ResponsiveContainer width="100%" height={300}><BarChart layout="vertical" data={data}><XAxis type="number" /><YAxis type="category" dataKey="name" /><Tooltip /><Bar dataKey="value" fill="#1a365d" /></BarChart></ResponsiveContainer>
}
