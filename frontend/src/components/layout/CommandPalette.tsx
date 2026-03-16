'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { 
  Plus, 
  Search, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Calendar,
  ClipboardList,
  GraduationCap
} from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { user, logout } = useAuthStore()

  // Toggle the menu when ⌘K or Ctrl+K is pressed
  useHotkeys(['mod+k', 'mod+p'], (e) => {
    e.preventDefault()
    setOpen((open) => !open)
  })

  // Global chorded shortcuts: g d (Go Dashboard), g s (Go Students), etc.
  useHotkeys('g+d', () => router.push('/dashboard'))
  useHotkeys('g+s', () => router.push('/students'))
  useHotkeys('g+e', () => router.push('/exams'))
  useHotkeys('g+c', () => router.push('/classes'))
  useHotkeys('g+t', () => router.push('/teachers'))
  useHotkeys('g+p', () => router.push('/reports'))

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  if (!user) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pb-24 px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto"
            >
              <Command className="flex flex-col h-full max-h-[70vh]">
                <div className="flex items-center px-4 border-b border-slate-100">
                  <Search className="w-5 h-5 text-slate-400 mr-2" />
                  <Command.Input
                    placeholder="Search students, exams or type a command..."
                    className="flex-1 h-16 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  />
                  <div className="px-2 py-1 bg-slate-100 rounded-md text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    ESC to close
                  </div>
                </div>

                <Command.List className="overflow-y-auto p-2 scrollbar-hide">
                  <Command.Empty className="px-4 py-8 text-center text-slate-500 font-medium italic">
                    No results found for that search.
                  </Command.Empty>

                  <Command.Group heading="Top Actions" className="px-2 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    <CommandItem icon={<Plus />} onSelect={() => runCommand(() => router.push('/exams/new'))}>
                      Create New Exam
                    </CommandItem>
                    <CommandItem icon={<Users />} onSelect={() => runCommand(() => router.push('/students'))}>
                      Manage Students
                    </CommandItem>
                    <CommandItem icon={<Calendar />} onSelect={() => runCommand(() => router.push('/attendance'))}>
                      Take Attendance
                    </CommandItem>
                  </Command.Group>

                  <Command.Group heading="Quick Navigation" className="px-2 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    <CommandItem icon={<FileText />} onSelect={() => runCommand(() => router.push('/exams'))}>
                      View All Exams
                    </CommandItem>
                    <CommandItem icon={<ClipboardList />} onSelect={() => runCommand(() => router.push('/results'))}>
                      Academic Reports
                    </CommandItem>
                    <CommandItem icon={<GraduationCap />} onSelect={() => runCommand(() => router.push('/classes'))}>
                      Class Management
                    </CommandItem>
                  </Command.Group>

                  {user.role === 'Principal' && (
                    <Command.Group heading="Administration" className="px-2 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                      <CommandItem icon={<Users />} onSelect={() => runCommand(() => router.push('/teachers'))}>
                        Manage Faculty
                      </CommandItem>
                      <CommandItem icon={<Settings />} onSelect={() => runCommand(() => router.push('/settings'))}>
                        School Settings
                      </CommandItem>
                    </Command.Group>
                  )}

                  <Command.Separator className="h-px bg-slate-100 my-2" />
                  
                  <Command.Group heading="Account" className="px-2 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                     <CommandItem 
                      icon={<LogOut className="text-rose-500" />} 
                      onSelect={() => runCommand(() => { logout(); router.push('/login'); })}
                    >
                      <span className="text-rose-500">Sign Out Account</span>
                    </CommandItem>
                  </Command.Group>
                </Command.List>

                <div className="px-4 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">Enter</kbd> to select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm">↑↓</kbd> to navigate
                    </span>
                  </div>
                  <div>
                    Powered by <span className="text-indigo-600">EduTrack AI</span>
                  </div>
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function CommandItem({ 
  children, 
  icon, 
  onSelect 
}: { 
  children: React.ReactNode; 
  icon: React.ReactNode; 
  onSelect?: () => void 
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-default select-none aria-selected:bg-indigo-50 aria-selected:text-indigo-900 text-slate-600 transition-all duration-200 font-semibold group"
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 group-aria-selected:bg-indigo-100 group-aria-selected:text-indigo-600 transition-colors">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </div>
      {children}
    </Command.Item>
  )
}
