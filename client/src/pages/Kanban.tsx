import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { useTaskStore, Task } from '../store/taskStore'
import { TaskCard } from '../components/TaskCard'
import { Modal } from '../components/Modal'
import { TaskForm } from '../components/TaskForm'
import { Plus, Moon, Sun, LogOut, LayoutList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Status, CreateTaskDto } from '../store/taskStore'
import { statusColors } from '../utils/taskUtils'

const columns: { id: Status; title: string }[] = [
  { id: 'PENDING', title: 'Pendiente' },
  { id: 'IN_PROGRESS', title: 'En progreso' },
  { id: 'COMPLETED', title: 'Completada' },
]

export const Kanban = () => {
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, updateStatus } = useTaskStore()
  const { user, logout } = useAuthStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreateTask = (data: CreateTaskDto) => {
    createTask(data)
    setIsModalOpen(false)
  }

  const handleUpdateTask = (data: CreateTaskDto) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
      setIsModalOpen(false)
      setEditingTask(null)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      deleteTask(id)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event
    
    if (!over) return
    
    const taskId = active.id as string
    const newStatus = over.id as Status
    
    if (taskId && newStatus) {
      updateStatus(taskId, newStatus)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <LayoutList className="w-5 h-5" />
                <span className="hidden sm:inline">Lista</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nueva tarea
          </button>
        </div>

        {/* Kanban Board */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
              const columnTasks = getTasksByStatus(column.id)
              
              return (
                <div
                  key={column.id}
                  className={`${statusColors[column.id]} rounded-xl p-4`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {column.title}
                    </h2>
                    <span className="px-2 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  <div
                    id={column.id}
                    className="space-y-3 min-h-[200px]"
                  >
                    {isLoading ? (
                      [1, 2].map(i => (
                        <div
                          key={i}
                          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse"
                        >
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        </div>
                      ))
                    ) : columnTasks.length > 0 ? (
                      (columnTasks as Task[]).map((task: Task) => (
                        <div
                          key={task.id}
                          id={task.id}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <TaskCard
                            task={task}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        Sin tareas
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DndContext>
      </main>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
        />
      </Modal>
    </div>
  )
}
