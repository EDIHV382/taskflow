import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

// Detectar si estamos en production (Vercel) o development
// En production, usar la misma URL del frontend (las API routes están en el mismo dominio)
// En development, usar localhost:5000
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : window.location.origin

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
          withCredentials: true,
        })
        
        const { accessToken } = refreshResponse.data
        
        document.cookie = `accessToken=${accessToken}; path=/; max-age=900`
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export default api
