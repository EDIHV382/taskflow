import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { LayoutList, KanbanSquare, Moon, Sun, LogOut, CheckCircle, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/axios'
import { StatusChart } from '../components/charts/StatusChart'
import { PriorityChart } from '../components/charts/PriorityChart'
import { TrendChart } from '../components/charts/TrendChart'
import { ProductivityChart } from '../components/charts/ProductivityChart'
import { AnimatedCounter } from '../components/AnimatedCounter'

interface StatsData {
  overview: {
    totalTasks: number
    pendingTasks: number
    inProgressTasks: number
    completedTasks: number
    overdueTasks: number
    completionRate: number
  }
  weekly: {
    completedThisWeek: number
    completedThisMonth: number
  }
  distribution: {
    byPriority: { HIGH: number; MEDIUM: number; LOW: number }
    byStatus: { PENDING: number; IN_PROGRESS: number; COMPLETED: number }
  }
  trends: {
    completionTrend: { date: string; completed: number }[]
    productivityByDay: { day: string; completed: number }[]
  }
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string
  value: number
  icon: React.ElementType
  color: string
  subtitle?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <div className="mt-2 flex items-baseline">
          <span className={`text-3xl font-bold ${color}`}>
            <AnimatedCounter value={value} />
          </span>
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </motion.div>
)

export const Stats = () => {
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LayoutList className="w-5 h-5" />
                <span className="hidden sm:inline">Lista</span>
              </Link>
              <Link
                to="/kanban"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <KanbanSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Kanban</span>
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total de Tareas"
            value={stats?.overview.totalTasks || 0}
            icon={CheckCircle}
            color="text-blue-600"
            subtitle="Todas las tareas"
          />
          <StatCard
            title="Pendientes"
            value={stats?.overview.pendingTasks || 0}
            icon={Clock}
            color="text-amber-600"
            subtitle="Por hacer"
          />
          <StatCard
            title="En Progreso"
            value={stats?.overview.inProgressTasks || 0}
            icon={TrendingUp}
            color="text-blue-500"
            subtitle="Activas"
          />
          <StatCard
            title="Completadas"
            value={stats?.overview.completedTasks || 0}
            icon={CheckCircle}
            color="text-green-600"
            subtitle={`${stats?.overview.completionRate || 0}% de éxito`}
          />
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas esta semana</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={stats?.weekly.completedThisWeek || 0} />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas este mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={stats?.weekly.completedThisMonth || 0} />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <AnimatedCounter value={stats?.overview.overdueTasks || 0} />
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Estado
            </h3>
            <StatusChart data={stats?.distribution.byStatus || { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0 }} />
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribución por Prioridad
            </h3>
            <PriorityChart data={stats?.distribution.byPriority || { HIGH: 0, MEDIUM: 0, LOW: 0 }} />
          </motion.div>

          {/* Completion Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendencia de Completadas (Últimos 7 días)
            </h3>
            <TrendChart data={stats?.trends.completionTrend || []} />
          </motion.div>

          {/* Productivity by Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Productividad por Día (Últimos 30 días)
            </h3>
            <ProductivityChart data={stats?.trends.productivityByDay || []} />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
