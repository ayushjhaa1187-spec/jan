'use client'

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  labels: string[]
  values: number[]
}

export default function SubjectAveragesChart({ labels, values }: Props) {
  const data = labels.map((label, index) => ({ subject: label, value: values[index] ?? 0 }))

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <XAxis dataKey='subject' />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey='value' fill='#2b6cb0'>
          <LabelList dataKey='value' position='top' />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
