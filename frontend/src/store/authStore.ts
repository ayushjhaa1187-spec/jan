import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  hasPermission: (p: string) => boolean
  hasRole: (...roles: string[]) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  hasPermission: (p) => get().user?.permissions.includes(p) ?? false,
  hasRole: (...roles) => roles.includes(get().user?.role ?? ''),
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null })
  },
}))
