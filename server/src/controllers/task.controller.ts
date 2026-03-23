import { Request, Response, NextFunction } from 'express'
import { TaskService } from '../services/task.service.js'
import { createTaskSchema, updateTaskSchema, updateStatusSchema } from '../validators/task.validator.js'

const taskService = new TaskService()

export class TaskController {
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const filters: Record<string, unknown> = {}
      
      if (req.query.status) {
        filters.status = req.query.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
      }
      
      if (req.query.priority) {
        filters.priority = req.query.priority as 'HIGH' | 'MEDIUM' | 'LOW'
      }
      
      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as 'dueDate' | 'priority' | 'createdAt'
      }
      
      if (req.query.order) {
        filters.order = req.query.order as 'asc' | 'desc'
      }
      
      const tasks = await taskService.getTasks(userId, filters)
      res.status(200).json(tasks)
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const task = await taskService.getTaskById(req.params.id, userId)
      res.status(200).json(task)
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const validatedData = createTaskSchema.parse(req.body)
      const task = await taskService.createTask(userId, validatedData)
      res.status(201).json(task)
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const validatedData = updateTaskSchema.parse(req.body)
      const task = await taskService.updateTask(req.params.id, userId, validatedData)
      res.status(200).json(task)
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      await taskService.deleteTask(req.params.id, userId)
      res.status(204).send()
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const validatedData = updateStatusSchema.parse(req.body)
      const task = await taskService.updateStatus(req.params.id, userId, validatedData.status)
      res.status(200).json(task)
    } catch (error) {
      next(error)
    }
    return undefined
  }

  async getCounts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return undefined
      }
      
      const counts = await taskService.getCounts(userId)
      res.status(200).json(counts)
    } catch (error) {
      next(error)
    }
    return undefined
  }
}
