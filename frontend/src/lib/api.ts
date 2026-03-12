import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: false,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    if (!original) return Promise.reject(error)

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        )
        localStorage.setItem('accessToken', (data as { data: { accessToken: string } }).data.accessToken)
        original.headers = original.headers || {}
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
