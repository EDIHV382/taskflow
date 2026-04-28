import { Task } from '../store/taskStore'
import { priorityColors, statusColors, formatDate } from '../utils/taskUtils'
import { Pencil, Trash2, Calendar } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 dark:text-white flex-1">
          {task.title}
        </h3>
        <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(task)}
        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        aria-label="Editar tarea"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(task.id)}
        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        aria-label="Eliminar tarea"
      >
        <Trash2 className="w-4 h-4" />
      </button>
        </div>
      </div>
      
      {task.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>
      
      {task.dueDate && (
        <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(task.dueDate)}
        </div>
      )}
    </div>
  )
}
