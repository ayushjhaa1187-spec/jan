import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as { _retry?: boolean; headers: Record<string, string> }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        )
        localStorage.setItem('accessToken', (data as { data: { accessToken: string } }).data.accessToken)
        original.headers.Authorization = `Bearer ${(data as { data: { accessToken: string } }).data.accessToken}`
        return api(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (typeof window !== 'undefined') window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
