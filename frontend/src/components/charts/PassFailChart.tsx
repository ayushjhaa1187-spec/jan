'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  labels?: string[];
  values?: number[];
  colors?: string[];
}

export function PassFailChart({ labels = [], values = [], colors = [] }: Props) {
  const data = labels.map((label, index) => ({ 
    name: label, 
    value: values[index] ?? 0, 
    color: colors[index] ?? '#1a365d' 
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-400 italic">
        No pass/fail data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie 
          data={data} 
          dataKey="value" 
          nameKey="name" 
          innerRadius={60} 
          outerRadius={80} 
          paddingAngle={5}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
