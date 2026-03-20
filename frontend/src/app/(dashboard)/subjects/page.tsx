'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Table, Column } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus, ArrowRight } from 'lucide-react'

const schema = z.object({
  code: z.string().min(2, 'Subject code is required (e.g. MATH101)'),
  name: z.string().min(2, 'Subject name is required'),
})
type FormValues = z.infer<typeof schema>

interface SubjectRow {
  id: string
  code: string
  name: string
  _count?: { classes?: number; teachers?: number }
}

export default function SubjectsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<SubjectRow | null>(null)
  const [deleting, setDeleting] = useState<SubjectRow | null>(null)
  const [open, setOpen] = useState(false)

  const subjects = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => (await api.get('/subjects')).data,
  })

  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => (await api.post('/subjects', payload)).data,
    onSuccess: async () => {
      toast.success('Subject created successfully')
      await qc.invalidateQueries({ queryKey: ['subjects'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to create subject'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FormValues }) =>
      (await api.put(`/subjects/${id}`, payload)).data,
    onSuccess: async () => {
      toast.success('Subject updated')
      await qc.invalidateQueries({ queryKey: ['subjects'] })
      setEditing(null)
    },
    onError: () => toast.error('Failed to update subject'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/subjects/${id}`)).data,
    onSuccess: async () => {
      toast.success('Subject deleted')
      await qc.invalidateQueries({ queryKey: ['subjects'] })
      setDeleting(null)
    },
    onError: () => toast.error('Failed to delete subject'),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '' },
  })

  const columns = useMemo<Column<SubjectRow>[]>(
    () => [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Subject Name' },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditing(row)
                form.reset({ code: row.code, name: row.name })
              }}
            >
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => setDeleting(row)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [form]
  )

  const rows: SubjectRow[] = subjects.data?.data ?? []

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
           <h1 className="text-6xl font-black text-slate-950 tracking-tighter mb-4 leading-none uppercase">Curriculum <br /> <span className="text-indigo-600">Infrastructure.</span></h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Institutional Subject Catalog & Governance</p>
        </div>
        <Button 
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.96 }}
          className="py-10 px-12 bg-slate-950 hover:bg-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm text-white shadow-2xl shadow-slate-200 flex items-center gap-4 transition-all"
          onClick={() => {
            form.reset({ code: '', name: '' })
            setOpen(true)
          }}
        >
          <Plus size={22} className="text-indigo-400" />
          Initialize New Subject
        </Button>
      </div>

      <Card className="rounded-[3.5rem] border-white shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30" />
        <div className="bg-white/50 backdrop-blur-3xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <Table
            columns={[
              { 
                key: 'code', 
                label: 'Protocol Code',
                render: (r) => <span className="font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg text-[10px] uppercase">{r.code}</span>
              },
              { 
                key: 'name', 
                label: 'Cognitive Domain',
                render: (r) => <span className="font-black text-slate-950 uppercase tracking-tight text-xs">{r.name}</span>
              },
              {
                key: 'actions',
                label: 'Governance',
                render: (row) => (
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(row)
                        form.reset({ code: row.code, name: row.name })
                      }}
                    >
                      Config
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleting(row)}>
                      Purge
                    </Button>
                  </div>
                ),
              },
            ]}
            data={rows}
            loading={subjects.isLoading}
            keyExtractor={(r) => r.id}
            emptyMessage="No subject protocols found in the current cluster."
          />
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={open || Boolean(editing)}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit Subject' : 'Create New Subject'}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false)
                setEditing(null)
              }}
            >
              Cancel
            </Button>
            <Button
              loading={createMutation.isPending || updateMutation.isPending}
              onClick={form.handleSubmit(async (values) => {
                if (editing) {
                  await updateMutation.mutateAsync({ id: editing.id, payload: values })
                } else {
                  await createMutation.mutateAsync(values)
                }
              })}
            >
              {editing ? 'Update Subject' : 'Create Subject'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Subject Code"
            placeholder="e.g. MATH101, ENG201"
            {...form.register('code')}
            error={form.formState.errors.code?.message}
          />
          <Input
            label="Subject Name"
            placeholder="e.g. Mathematics, English Literature"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={async () => deleting && deleteMutation.mutateAsync(deleting.id)}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete <strong className="text-gray-900">{deleting?.name}</strong> ({deleting?.code})? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
