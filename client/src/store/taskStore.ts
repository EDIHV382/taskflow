import { create } from 'zustand'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { persist } from 'zustand/middleware'

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface Task {
  id: string
  title: string
  description?: string | null
  priority: Priority
  status: Status
  dueDate?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  priority: Priority
  status: Status
  dueDate?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  priority?: Priority
  status?: Status
  dueDate?: string
}

export interface TaskFilters {
  status?: Status
  priority?: Priority
  search?: string
}

export type SortBy = 'dueDate' | 'priority' | 'createdAt'
export type SortOrder = 'asc' | 'desc'

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  filters: TaskFilters
  sortBy: SortBy
  order: SortOrder
  pagination: Pagination
  isDemoMode: boolean
  searchQuery: string
  fetchTasks: (page?: number) => Promise<void>
  createTask: (data: CreateTaskDto) => Promise<void>
  updateTask: (id: string, data: UpdateTaskDto) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateStatus: (id: string, status: Status) => Promise<void>
  setFilters: (filters: TaskFilters) => void
  setSorting: (sortBy: SortBy, order: SortOrder) => void
  setSearchQuery: (query: string) => void
  getFilteredTasks: () => Task[]
  resetToDemo: () => void
}

// Tareas demo iniciales
const demoTasks: Task[] = [
  {
    id: 'demo-1',
    title: '👋 Bienvenido a TaskFlow',
    description: 'Esta es tu primera tarea de ejemplo. ¡Prueba el drag & drop en el tablero Kanban!',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: '🎨 Explora el Dashboard',
    description: 'Usa la búsqueda, filtros y paginación para organizar tus tareas.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    title: '🌙 Prueba el Dark Mode',
    description: 'Alterna entre modo claro y oscuro con el botón en el header.',
    priority: 'LOW',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: '📱 Diseño Responsivo',
    description: 'TaskFlow se adapta perfectamente a móviles, tablets y escritorio.',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: '🚀 Seguridad JWT + Rate Limiting',
    description: 'Autenticación con tokens seguros, cookies HttpOnly y protección contra fuerza bruta.',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    title: '✨ TypeScript + Zod v4',
    description: 'Código tipado de extremo a extremo con validaciones robustas.',
    priority: 'HIGH',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  hasMore: false,
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      filters: {},
      sortBy: 'createdAt',
      order: 'desc',
      pagination: defaultPagination,
      isDemoMode: true,
      searchQuery: '',

      fetchTasks: async (page = 1) => {
        set({ isLoading: true })

        const { filters, sortBy, order, searchQuery, isDemoMode, pagination } = get()

        if (isDemoMode) {
          // Simular delay
          await new Promise(resolve => setTimeout(resolve, 300))

          // Filtrar tareas demo
          let filtered = [...demoTasks]

          if (filters.status) {
            filtered = filtered.filter((t) => t.status === filters.status)
          }

          if (filters.priority) {
            filtered = filtered.filter((t) => t.priority === filters.priority)
          }

          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
              (t) =>
                t.title.toLowerCase().includes(query) ||
                (t.description?.toLowerCase().includes(query) ?? false)
            )
          }

          // Ordenar
          filtered.sort((a, b) => {
            if (sortBy === 'priority') {
              const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
              const aValue = priorityOrder[a.priority]
              const bValue = priorityOrder[b.priority]
              return order === 'asc' ? aValue - bValue : bValue - aValue
            } else if (sortBy === 'dueDate') {
              const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
              const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
              return order === 'asc' ? aDate - bDate : bDate - aDate
            } else {
              const aDate = new Date(a.createdAt).getTime()
              const bDate = new Date(b.createdAt).getTime()
              return order === 'asc' ? aDate - bDate : bDate - aDate
            }
          })

          // Paginar
          const limit = pagination.limit
          const start = (page - 1) * limit
          const end = start + limit
          const paginated = filtered.slice(start, end)

          set({
            tasks: paginated,
            pagination: {
              page,
              limit,
              total: filtered.length,
              totalPages: Math.ceil(filtered.length / limit),
              hasMore: end < filtered.length,
            },
            isLoading: false,
          })
          return
        }

        // Modo API
        try {
          const params = new URLSearchParams()
          params.append('page', page.toString())
          params.append('limit', pagination.limit.toString())

          if (filters.status) params.append('status', filters.status)
          if (filters.priority) params.append('priority', filters.priority)
          if (searchQuery) params.append('search', searchQuery)
          if (sortBy) params.append('sortBy', sortBy)
          if (order) params.append('order', order)

          const response = await api.get(`/api/tasks?${params.toString()}`)
          const { tasks, pagination: apiPagination } = response.data

          set({
            tasks,
            pagination: apiPagination,
            isLoading: false,
          })
        } catch {
          set({ isLoading: false })
          toast.error('Failed to fetch tasks')
        }
      },

      createTask: async (data) => {
        if (get().isDemoMode) {
          const newTask: Task = {
            ...data,
            id: `temp-${Date.now()}`,
            description: data.description ?? null,
            dueDate: data.dueDate ?? null,
            userId: 'demo-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          set((state) => ({ tasks: [...state.tasks, newTask] }))
          toast.success('✅ Tarea creada (modo demo)')
          return
        }

        try {
          const response = await api.post('/api/tasks', data)
          set((state) => ({ tasks: [...state.tasks, response.data] }))
          toast.success('Task created successfully')
        } catch {
          toast.error('Failed to create task')
        }
      },

      updateTask: async (id, data) => {
        if (get().isDemoMode) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
            ),
          }))
          toast.success('✅ Tarea actualizada (modo demo)')
          return
        }

        try {
          const response = await api.put(`/api/tasks/${id}`, data)
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
          }))
          toast.success('Task updated successfully')
        } catch {
          toast.error('Failed to update task')
        }
      },

      deleteTask: async (id) => {
        if (get().isDemoMode) {
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
          toast.success('✅ Tarea eliminada (modo demo)')
          return
        }

        try {
          await api.delete(`/api/tasks/${id}`)
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
          toast.success('Task deleted successfully')
        } catch {
          toast.error('Failed to delete task')
        }
      },

      updateStatus: async (id, status) => {
        if (get().isDemoMode) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
            ),
          }))
          return
        }

        try {
          const response = await api.put(`/api/tasks/${id}`, { status })
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
          }))
        } catch {
          toast.error('Failed to update status')
        }
      },

      setFilters: (filters) => {
        set({ filters, pagination: { ...get().pagination, page: 1 } })
        get().fetchTasks(1)
      },

      setSorting: (sortBy, order) => {
        set({ sortBy, order })
        get().fetchTasks()
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } })
        get().fetchTasks(1)
      },

      getFilteredTasks: () => {
        const { tasks, filters, sortBy, order } = get()

        let filtered = [...tasks]

        if (filters.status) {
          filtered = filtered.filter((t) => t.status === filters.status)
        }

        if (filters.priority) {
          filtered = filtered.filter((t) => t.priority === filters.priority)
        }

        filtered.sort((a, b) => {
          if (sortBy === 'priority') {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
            const aValue = priorityOrder[a.priority]
            const bValue = priorityOrder[b.priority]
            return order === 'asc' ? aValue - bValue : bValue - aValue
          } else if (sortBy === 'dueDate') {
            const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
            const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
            return order === 'asc' ? aDate - bDate : bDate - aDate
          } else {
            const aDate = new Date(a.createdAt).getTime()
            const bDate = new Date(b.createdAt).getTime()
            return order === 'asc' ? aDate - bDate : bDate - aDate
          }
        })

        return filtered
      },

      resetToDemo: () => {
        set({ tasks: demoTasks, pagination: defaultPagination })
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({
        filters: state.filters,
        sortBy: state.sortBy,
        order: state.order,
        pagination: state.pagination,
      }),
      skipHydration: true,
    }
  )
)
