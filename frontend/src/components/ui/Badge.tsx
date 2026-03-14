import { getStatusColor } from '@/lib/utils'

export function Badge({ status, label }: { status: string; label?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(status)}`}>{label ?? status}</span>
}
