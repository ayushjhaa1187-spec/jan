'use client'
import Link from 'next/link'
import { NotificationBell } from './NotificationBell'

export function Header() {
  return <header className='bg-white border-b p-4 flex justify-between items-center'><h1 className='font-semibold'>EduTrack</h1><div className='flex items-center gap-4'><NotificationBell /><Link href='/notifications'>View All</Link></div></header>
}
