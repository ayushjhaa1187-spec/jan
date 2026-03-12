'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  labels: string[]
  values: number[]
}

export default function TopPerformersChart({ labels, values }: Props) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} layout='vertical'>
        <XAxis type='number' domain={[0, 100]} />
        <YAxis type='category' dataKey='name' width={120} />
        <Tooltip />
        <Bar dataKey='value' fill='#1a365d' />
      </BarChart>
    </ResponsiveContainer>
  )
}
