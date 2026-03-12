import { cn } from '@/lib/utils'
const statusColors: Record<string,string> = { DRAFT:'bg-gray-100 text-gray-700', REVIEW:'bg-yellow-100 text-yellow-700', APPROVED:'bg-blue-100 text-blue-700', PUBLISHED:'bg-green-100 text-green-700', PASS:'bg-green-100 text-green-700', FAIL:'bg-red-100 text-red-700' }
export const Badge = ({ label }: { label: string }) => <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColors[label] || 'bg-slate-100 text-slate-700')}>{label}</span>
