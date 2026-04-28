import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTaskStore, Task, CreateTaskDto } from '../store/taskStore'
import { TaskCard } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { Pagination } from '../components/Pagination'
import { SkeletonCardGrid, SkeletonCardList } from '../components/SkeletonCard'
import { useDebounce } from '../hooks/useDebounce'
import { Plus, List, LayoutGrid, Moon, Sun, LogOut, KanbanSquare, BarChart3, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Status, Priority } from '../store/taskStore'

export const Dashboard = () => {
  const {
    tasks,
    isLoading,
    pagination,
    filters,
    searchQuery,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    setSorting,
    setSearchQuery,
    fetchTasks,
    getFilteredTasks,
  } = useTaskStore()
  const { user, logout } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
  const [darkMode, setDarkMode] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [localSearch, setLocalSearch] = useState('')

  // Debounce search query
  const debouncedSearch = useDebounce(localSearch, 300)

  // Apply debounced search to store
  useEffect(() => {
    setSearchQuery(debouncedSearch)
  }, [debouncedSearch, setSearchQuery])

  // Cargar tareas automáticamente al montar
  useEffect(() => {
    fetchTasks(1)
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

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id)
  }

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete)
      setTaskToDelete(null)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value || undefined,
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    if (value === 'newest') {
      setSorting('createdAt', 'desc')
    } else if (value === 'oldest') {
      setSorting('createdAt', 'asc')
    } else if (value === 'priority') {
      setSorting('priority', 'desc')
    }
  }

  const clearFilters = () => {
    setFilters({})
    setLocalSearch('')
    setSearchQuery('')
  }

  const hasActiveFilters = filters.status || filters.priority || searchQuery

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
            <Link
              to="/kanban"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <KanbanSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Kanban</span>
            </Link>
            <Link
              to="/stats"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Estadísticas</span>
            </Link>
          </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => logout()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Logout"
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
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="COMPLETED">Completada</option>
            </select>

            <select
              name="priority"
              value={filters.priority || ''}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Todas las prioridades</option>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>

            <select
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="priority">Por prioridad</option>
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpiar filtros
              </button>
            )}

            {/* View mode toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-label="Vista grid"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                aria-label="Vista lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Add task */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nueva tarea</span>
            </button>
          </div>
        </div>

      {/* Task list/grid */}
      {isLoading ? (
        viewMode === 'grid' ? <SkeletonCardGrid /> : <SkeletonCardList />
      ) : viewMode === 'grid' ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {getFilteredTasks().map((task: Task, index: number) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {getFilteredTasks().map((task: Task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && tasks.length > 0 && (
          <Pagination pagination={pagination} onPageChange={fetchTasks} />
        )}

        {/* Empty state */}
        {getFilteredTasks().length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No se encontraron tareas
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {hasActiveFilters
                ? 'Prueba con otros filtros o términos de búsqueda'
                : 'Crea tu primera tarea para empezar'}
            </p>
          </div>
        )}
      </main>

      {/* Task Modal */}
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

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
