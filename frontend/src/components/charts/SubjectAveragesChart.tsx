'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function SubjectAveragesChart({ labels, values }: { labels: string[]; values: number[] }) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#2b6cb0" />
      </BarChart>
    </ResponsiveContainer>
  )
}
