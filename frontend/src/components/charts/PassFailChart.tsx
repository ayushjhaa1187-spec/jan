'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  labels: string[]
  values: number[]
  colors?: string[]
}

const defaultColors = ['#276749', '#c53030', '#b7791f']

export default function PassFailChart({ labels, values, colors = defaultColors }: Props) {
  const data = labels.map((label, index) => ({ name: label, value: values[index] ?? 0 }))

  return (
    <ResponsiveContainer width='100%' height={300}>
      <PieChart>
        <Pie data={data} dataKey='value' nameKey='name' outerRadius={100}>
          {data.map((_, index) => <Cell key={index} fill={colors[index] || defaultColors[index % defaultColors.length]} />)}
        </Pie>
        <Tooltip />
        <Legend verticalAlign='bottom' />
      </PieChart>
    </ResponsiveContainer>
  )
}
