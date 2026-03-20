'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, ArrowRight } from 'lucide-react'

const schema = z.object({ name: z.string().min(1), section: z.string().min(1), year: z.coerce.number().min(2000).max(2100) })
type FormValues = z.infer<typeof schema>
interface ClassRow { id: string; name: string; section: string; year: number }

export default function ClassesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [deleting, setDeleting] = useState<ClassRow | null>(null)
  const [open, setOpen] = useState(false)

  const classes = useQuery({ queryKey: ['classes'], queryFn: async () => (await api.get('/classes')).data })
  const createMutation = useMutation({ mutationFn: async (payload: FormValues) => (await api.post('/classes', payload)).data, onSuccess: async () => { toast.success('Class created'); await qc.invalidateQueries({ queryKey: ['classes'] }); setOpen(false) } })
  const updateMutation = useMutation({ mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) => (await api.put(`/classes/${id}`, payload)).data, onSuccess: async () => { toast.success('Class updated'); await qc.invalidateQueries({ queryKey: ['classes'] }); setEditing(null) } })
  const deleteMutation = useMutation({ mutationFn: async (id: string) => (await api.delete(`/classes/${id}`)).data, onSuccess: async () => { toast.success('Class deleted'); await qc.invalidateQueries({ queryKey: ['classes'] }); setDeleting(null) } })

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', section: '', year: new Date().getFullYear() } })

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="text-6xl font-black text-slate-950 tracking-tighter mb-4 leading-none uppercase">Academic <br /> <span className="text-indigo-600">Bundles.</span></h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Institutional Class & Section Architecture</p>
        </div>
        <Button 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="py-10 px-12 bg-slate-950 hover:bg-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl shadow-slate-200 flex items-center gap-4 transition-all"
          onClick={() => { form.reset({ name: '', section: '', year: new Date().getFullYear() }); setOpen(true) }}
        >
          <Plus size={22} className="text-indigo-400" />
          Provision New Class
        </Button>
      </div>

      <Card className="rounded-[3.5rem] border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30" />
        <div className="bg-white/50 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <Table 
            columns={[
              { key: 'name', label: 'Identity' }, 
              { key: 'section', label: 'Cluster' }, 
              { key: 'year', label: 'Session' }, 
              { 
                key: 'actions', 
                label: 'Governance', 
                render: (r) => (
                  <div className="flex gap-3">
                    <Button size="sm" variant="secondary" onClick={() => { const item = r as ClassRow; setEditing(item); form.reset({ name: item.name, section: item.section, year: item.year }) }}>Configure</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleting(r as ClassRow)}>Decomission</Button>
                  </div>
                ) 
              }
            ]} 
            data={classes.data?.data ?? []} 
            loading={classes.isLoading} 
            keyExtractor={(r) => (r as ClassRow).id} 
          />
        </div>
      </Card>

      <Modal isOpen={open || Boolean(editing)} onClose={() => { setOpen(false); setEditing(null) }} title={editing ? 'System Configuration' : 'Cluster Deployment'} footer={<><Button variant="secondary" onClick={() => { setOpen(false); setEditing(null) }}>Abort</Button><Button loading={createMutation.isPending || updateMutation.isPending} onClick={form.handleSubmit(async (values) => { if (editing) await updateMutation.mutateAsync({ id: editing.id, payload: values }); else await createMutation.mutateAsync(values) })}>{editing ? 'Verify & Commit' : 'Begin Deployment'}</Button></>}>
        <div className="p-4 space-y-6">
          <Input label="Protocol Name (e.g. 10th Grade)" {...form.register('name')} error={form.formState.errors.name?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Secure Section" {...form.register('section')} error={form.formState.errors.section?.message} />
            <Input type="number" label="Academic Cycle" {...form.register('year')} error={form.formState.errors.year?.message} />
          </div>
        </div>
      </Modal>
      
      <Modal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} title="System Deletion" footer={<><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={deleteMutation.isPending} onClick={async () => deleting && deleteMutation.mutateAsync(deleting.id)}>Confirm Deletion</Button></>}>
        <p className="text-sm font-medium text-slate-500">Decomission the cluster <strong>{deleting?.name}</strong>? This action will purge all student associations.</p>
      </Modal>
    </div>
  )
}

