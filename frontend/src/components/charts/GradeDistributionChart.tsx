'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  labels: string[]
  values: number[]
  colors: string[]
}

export default function GradeDistributionChart({ labels, values, colors }: Props) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} dataKey='value' nameKey='name' outerRadius={100} label={(entry) => `${entry.name}: ${entry.percent ? (entry.percent * 100).toFixed(1) : '0'}%`}>
          {data.map((_, index) => <Cell key={index} fill={colors[index] || '#2b6cb0'} />)}
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' />
      </PieChart>
    </ResponsiveContainer>
  )
}
