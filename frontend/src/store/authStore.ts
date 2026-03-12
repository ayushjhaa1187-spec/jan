import { create } from 'zustand'

interface User { id: string; name: string; email: string; role: string; permissions: string[] }
interface AuthStore {
  user: User | null
  setUser: (user: User | null) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  hasPermission: (permission) => get().user?.permissions.includes(permission) ?? false,
  hasRole: (role) => get().user?.role === role,
  logout: () => { localStorage.removeItem('accessToken'); set({ user: null }) }
}))
