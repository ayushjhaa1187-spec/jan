'use client'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const { data } = useNotifications(); const rows = data?.data ?? []
  return <div className='space-y-3'><h1 className='text-2xl font-bold'>Notifications</h1><button className='bg-[#2b6cb0] text-white px-3 py-2 rounded'>Mark All Read</button><div className='space-y-2'>{rows.map((n:{id:string;title:string;message:string;read:boolean})=><div key={n.id} className={`p-3 rounded bg-white ${n.read?'':'border-l-4 border-blue-500 bg-blue-50'}`}><div className='font-semibold'>{n.title}</div><div>{n.message}</div></div>)}</div></div>
}
