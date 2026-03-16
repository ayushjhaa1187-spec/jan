'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Table, Column } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { UserPlus, MoreVertical, Edit, Trash2 } from 'lucide-react'

import { useEffect } from 'react'
import api from '@/lib/api'

// MOCK_USERS can be removed or kept as initial state
const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  role: z.enum(['Principal', 'ExamDept', 'Teacher', 'OfficeStaff']),
})

type UserFormValues = z.infer<typeof userSchema>

export default function UsersManagementPage() {
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', phone: '', role: 'Teacher' }
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await api.get('/users')
      setUsers(response.data.data)
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  // Table Columns
  const columns = useMemo<Column<any>[]>(() => [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role', render: (row) => (
      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
        {row.role}
      </span>
    )},
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (row) => (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
        row.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    )},
    { key: 'actions', label: 'Action', render: (row) => (
      <div className="flex items-center gap-3">
        <button className="text-slate-400 hover:text-indigo-600 transition" title="Edit">
          <Edit className="w-4 h-4" />
        </button>
        <button className="text-slate-400 hover:text-red-600 transition" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
  ], [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const onSubmit = async (values: UserFormValues) => {
    try {
      await api.post('/users', values)
      toast.success(`${values.role} created successfully`)
      setIsModalOpen(false)
      form.reset()
      fetchUsers()
    } catch (e: any) {
      const message = e.response?.data?.error || 'Failed to create user'
      toast.error(message)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage staff roles, access, and accounts.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card>
        <div className="mb-6 flex gap-4 items-center">
          <Input 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <Table 
            columns={columns}
            data={filteredUsers}
            keyExtractor={(row) => row.id}
          />
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New User"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="Jane Doe"
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <Input 
            label="Email Address" 
            type="email"
            placeholder="jane@school.com"
            {...form.register('email')}
            error={form.formState.errors.email?.message}
          />
          <Input 
            label="Phone Number" 
            placeholder="+91 XXXXX XXXXX"
            {...form.register('phone')}
            error={form.formState.errors.phone?.message}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select 
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...form.register('role')}
            >
              <option value="Teacher">Teacher</option>
              <option value="Principal">Principal</option>
              <option value="ExamDept">Exam Department</option>
              <option value="OfficeStaff">Office Staff</option>
            </select>
            {form.formState.errors.role && (
              <span className="text-sm text-red-500">{form.formState.errors.role.message}</span>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
