'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface Props { labels: string[]; values: number[] }

export function SubjectAveragesChart({ labels, values }: Props) {
  const data = labels.map((label, i) => ({ name: label, average: values[i] }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="average" fill="#2b6cb0" radius={[4, 4, 0, 0]}>
          <LabelList dataKey="average" position="top" formatter={(value: number) => value.toFixed(1)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
