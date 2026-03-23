import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export interface User {
  id: string
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/login', credentials)
          const { user, accessToken } = response.data
          
          document.cookie = `accessToken=${accessToken}; path=/; max-age=900`
          
          set({ user, isAuthenticated: true, isLoading: false })
          toast.success('Welcome back!')
        } catch (error: unknown) {
          set({ isLoading: false })
          if (error instanceof Error && 'response' in error) {
            const err = error as { response?: { data?: { error?: string } } }
            toast.error(err.response?.data?.error || 'Login failed')
          } else {
            toast.error('Login failed')
          }
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/register', data)
          const { user, accessToken } = response.data
          
          document.cookie = `accessToken=${accessToken}; path=/; max-age=900`
          
          set({ user, isAuthenticated: true, isLoading: false })
          toast.success('Account created successfully!')
        } catch (error: unknown) {
          set({ isLoading: false })
          if (error instanceof Error && 'response' in error) {
            const err = error as { response?: { data?: { error?: string } } }
            toast.error(err.response?.data?.error || 'Registration failed')
          } else {
            toast.error('Registration failed')
          }
          throw error
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout')
          document.cookie = 'accessToken=; path=/; max-age=0'
          set({ user: null, isAuthenticated: false })
          toast.success('Logged out successfully')
        } catch {
          set({ user: null, isAuthenticated: false })
          toast.success('Logged out successfully')
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/api/auth/me')
          set({ user: response.data, isAuthenticated: true })
        } catch {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
