import { TaskRepository } from '../repositories/task.repository.js'
import { CreateTaskInput, UpdateTaskInput } from '../validators/task.validator.js'
import { Priority, Status } from '@prisma/client'

interface TaskFilters {
  status?: Status
  priority?: Priority
  sortBy?: 'dueDate' | 'priority' | 'createdAt'
  order?: 'asc' | 'desc'
}

export class TaskService {
  private taskRepository = new TaskRepository()

  async getTasks(userId: string, filters?: TaskFilters) {
    return this.taskRepository.findByUserId(userId, filters)
  }

  async getTaskById(id: string, userId: string) {
    const task = await this.taskRepository.findById(id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    if (task.userId !== userId) {
      throw new Error('Not authorized to access this task')
    }
    
    return task
  }

  async createTask(userId: string, data: CreateTaskInput) {
    const dueDate = data.dueDate ? new Date(data.dueDate) : null
    
    return this.taskRepository.create({
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      status: data.status,
      dueDate,
      userId,
    })
  }

  async updateTask(id: string, userId: string, data: UpdateTaskInput) {
    const task = await this.taskRepository.findById(id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    if (task.userId !== userId) {
      throw new Error('Not authorized to update this task')
    }
    
    const updateData: Record<string, unknown> = {}
    
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.status !== undefined) updateData.status = data.status
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate)
    
    return this.taskRepository.update(id, updateData)
  }

  async deleteTask(id: string, userId: string) {
    const task = await this.taskRepository.findById(id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    if (task.userId !== userId) {
      throw new Error('Not authorized to delete this task')
    }
    
    await this.taskRepository.delete(id)
  }

  async updateStatus(id: string, userId: string, status: Status) {
    const task = await this.taskRepository.findById(id)
    
    if (!task) {
      throw new Error('Task not found')
    }
    
    if (task.userId !== userId) {
      throw new Error('Not authorized to update this task')
    }
    
    return this.taskRepository.updateStatus(id, status)
  }

  async getCounts(userId: string) {
    const total = await this.taskRepository.countByUserId(userId)
    const pending = await this.taskRepository.countByStatus(userId, 'PENDING')
    const inProgress = await this.taskRepository.countByStatus(userId, 'IN_PROGRESS')
    const completed = await this.taskRepository.countByStatus(userId, 'COMPLETED')
    
    return { total, pending, inProgress, completed }
  }
}
