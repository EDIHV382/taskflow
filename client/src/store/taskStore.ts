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
}

export type SortBy = 'dueDate' | 'priority' | 'createdAt'
export type SortOrder = 'asc' | 'desc'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  filters: TaskFilters
  sortBy: SortBy
  order: SortOrder
  isDemoMode: boolean
  fetchTasks: () => Promise<void>
  createTask: (data: CreateTaskDto) => Promise<void>
  updateTask: (id: string, data: UpdateTaskDto) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateStatus: (id: string, status: Status) => Promise<void>
  setFilters: (filters: TaskFilters) => void
  setSorting: (sortBy: SortBy, order: SortOrder) => void
  getFilteredTasks: () => Task[]
  resetToDemo: () => void
}

// Tareas demo iniciales (se muestran al recargar)
const demoTasks: Task[] = [
  {
    id: 'demo-1',
    title: '👋 Bienvenido a TaskFlow',
    description: 'Esta es tu primera tarea de ejemplo. ¡Prueba el drag & drop en el tablero Kanban arrastrando esta tarea entre columnas!',
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
    description: 'Cambia entre vista grid y lista, prueba los filtros por estado y prioridad, y ordena las tareas por fecha o prioridad.',
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
    description: 'Haz clic en el ícono de luna/sol en el header para alternar entre modo claro y oscuro. ¡La preferencia se guarda automáticamente!',
    priority: 'LOW',
    status: 'COMPLETED',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    title: '📱 Verifica el Diseño Responsivo',
    description: 'Ajusta el tamaño del navegador para ver cómo la interfaz se adapta a móviles, tablets y escritorio.',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    title: '🚀 Comparte este Portfolio',
    description: 'Este proyecto demuestra: React 18, TypeScript, Node.js, Express, Prisma, PostgreSQL, JWT Auth, Drag & Drop, y más.',
    priority: 'HIGH',
    status: 'PENDING',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      filters: {},
      sortBy: 'createdAt',
      order: 'desc',
      isDemoMode: true, // Por defecto, modo demo activado

      // Inicializar con tareas demo
      fetchTasks: async () => {
        set({ isLoading: true })
        
        const { filters, sortBy, order } = get()
        
        // Si estamos en modo demo, cargar tareas demo en memoria con filtros aplicados (NO de la API)
        if (get().isDemoMode) {
          // Simular loading
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Aplicar filtros a las tareas demo
          let filtered = [...demoTasks]
          
          if (filters.status) {
            filtered = filtered.filter((t) => t.status === filters.status)
          }
          
          if (filters.priority) {
            filtered = filtered.filter((t) => t.priority === filters.priority)
          }
          
          // Aplicar ordenamiento
          if (sortBy === 'priority') {
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
            filtered.sort((a, b) => {
              const diff = priorityOrder[a.priority] - priorityOrder[b.priority]
              return order === 'asc' ? diff : -diff
            })
          } else if (sortBy === 'dueDate') {
            filtered.sort((a, b) => {
              const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
              const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
              return order === 'asc' ? aDate - bDate : bDate - aDate
            })
          } else if (sortBy === 'createdAt') {
            filtered.sort((a, b) => {
              const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              return order === 'asc' ? diff : -diff
            })
          }
          
          set({ tasks: filtered, isLoading: false })
          return
        }
        
        // Modo normal: cargar de la API
        try {
          const params = new URLSearchParams()
          
          if (filters.status) params.append('status', filters.status)
          if (filters.priority) params.append('priority', filters.priority)
          if (sortBy) params.append('sortBy', sortBy)
          if (order) params.append('order', order)
          
          const response = await api.get(`/api/tasks?${params.toString()}`)
          set({ tasks: response.data, isLoading: false })
        } catch {
          set({ isLoading: false })
          toast.error('Failed to fetch tasks')
        }
      },

      // Crear tarea SOLO en memoria (no llama a la API en modo demo)
      createTask: async (data) => {
        if (get().isDemoMode) {
          // Crear tarea temporal con ID único
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
          toast.success('✅ Tarea creada (temporal - se perderá al recargar)')
          return
        }
        
        // Modo normal: crear en API
        try {
          const response = await api.post('/api/tasks', data)
          set((state) => ({ tasks: [...state.tasks, response.data] }))
          toast.success('Task created successfully')
        } catch {
          toast.error('Failed to create task')
        }
      },

      // Editar tarea SOLO en memoria (no llama a la API en modo demo)
      updateTask: async (id, data) => {
        if (get().isDemoMode) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
            ),
          }))
          toast.success('✅ Tarea editada (temporal - se perderá al recargar)')
          return
        }
        
        // Modo normal: editar en API
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

      // Eliminar tarea SOLO en memoria (no llama a la API en modo demo)
      deleteTask: async (id) => {
        if (get().isDemoMode) {
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
          toast.success('✅ Tarea eliminada (temporal - se perderá al recargar)')
          return
        }
        
        // Modo normal: eliminar en API
        try {
          await api.delete(`/api/tasks/${id}`)
          set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
          toast.success('Task deleted successfully')
        } catch {
          toast.error('Failed to delete task')
        }
      },

      // Cambiar estado SOLO en memoria (no llama a la API en modo demo)
      updateStatus: async (id, status) => {
        if (get().isDemoMode) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
            ),
          }))
          return
        }
        
        // Modo normal: cambiar en API
        try {
          const response = await api.patch(`/api/tasks/${id}/status`, { status })
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? response.data : t)),
          }))
        } catch {
          toast.error('Failed to update status')
        }
      },

      setFilters: (filters) => {
        set({ filters })
      },

      setSorting: (sortBy, order) => {
        set({ sortBy, order })
      },

      getFilteredTasks: () => {
        const { tasks, filters, sortBy, order } = get()
        
        let filtered = [...tasks]
        
        // Aplicar filtros
        if (filters.status) {
          filtered = filtered.filter((t) => t.status === filters.status)
        }
        
        if (filters.priority) {
          filtered = filtered.filter((t) => t.priority === filters.priority)
        }
        
        // Aplicar sorting
        filtered.sort((a, b) => {
          if (sortBy === 'priority') {
            const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
            const aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
            const bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
            return order === 'asc' ? aValue - bValue : bValue - aValue
          } else if (sortBy === 'dueDate') {
            const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0
            const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0
            return order === 'asc' ? aDate - bDate : bDate - aDate
          } else {
            // createdAt
            const aDate = new Date(a.createdAt).getTime()
            const bDate = new Date(b.createdAt).getTime()
            return order === 'asc' ? aDate - bDate : bDate - aDate
          }
        })
        
        return filtered
      },

      // Resetear a tareas demo originales (se llama al recargar)
      resetToDemo: () => {
        set({ tasks: demoTasks })
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ 
        tasks: state.tasks,
        filters: state.filters,
        sortBy: state.sortBy,
        order: state.order,
      }),
      // NO persistir isDemoMode para que siempre empiece en modo demo
      skipHydration: true,
    }
  )
)
