import prisma from '../config/database.js'
import { Task, Priority, Status } from '@prisma/client'

interface TaskFilters {
  status?: Status
  priority?: Priority
  sortBy?: 'dueDate' | 'priority' | 'createdAt'
  order?: 'asc' | 'desc'
}

export class TaskRepository {
  async findById(id: string): Promise<Task | null> {
    return prisma.task.findUnique({
      where: { id },
    })
  }

  async findByUserId(userId: string, filters?: TaskFilters): Promise<Task[]> {
    const where: Record<string, unknown> = { userId }
    
    if (filters?.status) {
      where.status = filters.status
    }
    
    if (filters?.priority) {
      where.priority = filters.priority
    }
    
    const orderBy: Record<string, unknown> = {}
    
    if (filters?.sortBy === 'priority') {
      orderBy.priority = filters.order || 'asc'
    } else if (filters?.sortBy === 'dueDate') {
      orderBy.dueDate = filters.order || 'asc'
    } else {
      orderBy.createdAt = 'desc'
    }
    
    return prisma.task.findMany({
      where,
      orderBy,
    })
  }

  async create(data: {
    title: string
    description?: string | null
    priority: Priority
    status: Status
    dueDate?: Date | null
    userId: string
  }): Promise<Task> {
    return prisma.task.create({
      data,
    })
  }

  async update(id: string, data: {
    title?: string
    description?: string | null
    priority?: Priority
    status?: Status
    dueDate?: Date | null
  }): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, status: Status): Promise<Task> {
    return prisma.task.update({
      where: { id },
      data: { status },
    })
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.task.count({
      where: { userId },
    })
  }

  async countByStatus(userId: string, status: Status): Promise<number> {
    return prisma.task.count({
      where: { userId, status },
    })
  }
}
