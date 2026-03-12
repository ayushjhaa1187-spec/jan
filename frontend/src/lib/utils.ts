import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    PUBLISHED: 'bg-green-100 text-green-800',
    PASS: 'bg-green-100 text-green-800',
    FAIL: 'bg-red-100 text-red-800',
    INCOMPLETE: 'bg-orange-100 text-orange-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-700'
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
