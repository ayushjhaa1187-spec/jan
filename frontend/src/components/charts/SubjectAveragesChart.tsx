'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function SubjectAveragesChart({ labels = [], values = [] }: { labels?: string[]; values?: number[] }) {
  const data = labels.map((label, i) => ({ name: label, value: values[i] ?? 0 }))
  return <ResponsiveContainer width="100%" height={300}><BarChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2b6cb0" /></BarChart></ResponsiveContainer>
}
