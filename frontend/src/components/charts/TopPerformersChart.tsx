'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  labels?: string[];
  values?: number[];
}

export function TopPerformersChart({ labels = [], values = [] }: Props) {
  const data = labels.map((label, index) => ({ 
    name: label, 
    value: values[index] ?? 0 
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-gray-400 italic">
        No performance data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}
