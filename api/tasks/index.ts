import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { Request, Response } from '@vercel/node'
import { z } from 'zod'

const prisma = new PrismaClient()

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  dueDate: z.string().optional(),
})

export default async function handler(request: Request, response: Response) {
  if (request.method === 'GET') {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Access token missing' })
      }
      
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
      
      // Get query params
      const { status, priority, sortBy = 'createdAt', order = 'desc' } = request.query
      
      // Build where clause
      const where: Record<string, unknown> = { userId: decoded.userId }
      
      if (status) {
        where.status = status
      }
      
      if (priority) {
        where.priority = priority
      }
      
      // Build order clause
      const orderBy: Record<string, unknown> = {}
      
      if (sortBy === 'priority') {
        orderBy.priority = order
      } else if (sortBy === 'dueDate') {
        orderBy.dueDate = order
      } else {
        orderBy.createdAt = order
      }
      
      // Get tasks
      const tasks = await prisma.task.findMany({
        where,
        orderBy,
      })
      
      return response.status(200).json(tasks)
    } catch (error) {
      console.error('Get tasks error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  } else if (request.method === 'POST') {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Access token missing' })
      }
      
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
      
      // Parse body
      const validatedData = createTaskSchema.parse(request.body)
      
      // Create task
      const task = await prisma.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description ?? null,
          priority: validatedData.priority,
          status: validatedData.status,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          userId: decoded.userId,
        },
      })
      
      return response.status(201).json(task)
    } catch (error) {
      console.error('Create task error:', error)
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: 'Validation error', details: error.errors })
      }
      return response.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return response.status(405).json({ error: 'Method not allowed' })
  }
}
