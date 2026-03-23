import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { Request, Response } from '@vercel/node'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional(),
})

export default async function handler(request: Request, response: Response) {
  const taskId = request.params.id
  
  if (request.method === 'PUT') {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Access token missing' })
      }
      
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: decoded.userId,
        },
      })
      
      if (!existingTask) {
        return response.status(404).json({ error: 'Task not found' })
      }
      
      // Parse body
      const validatedData = updateTaskSchema.parse(request.body)
      
      // Update task
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...validatedData,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        },
      })
      
      return response.status(200).json(task)
    } catch (error) {
      console.error('Update task error:', error)
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: 'Validation error', details: error.errors })
      }
      return response.status(500).json({ error: 'Internal server error' })
    }
  } else if (request.method === 'DELETE') {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Access token missing' })
      }
      
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: decoded.userId,
        },
      })
      
      if (!existingTask) {
        return response.status(404).json({ error: 'Task not found' })
      }
      
      // Delete task
      await prisma.task.delete({
        where: { id: taskId },
      })
      
      return response.status(204).send()
    } catch (error) {
      console.error('Delete task error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  } else if (request.method === 'PATCH') {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ error: 'Access token missing' })
      }
      
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
      
      // Parse body
      const { status } = z.object({
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
      }).parse(request.body)
      
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: {
          id: taskId,
          userId: decoded.userId,
        },
      })
      
      if (!existingTask) {
        return response.status(404).json({ error: 'Task not found' })
      }
      
      // Update status
      const task = await prisma.task.update({
        where: { id: taskId },
        data: { status },
      })
      
      return response.status(200).json(task)
    } catch (error) {
      console.error('Update status error:', error)
      if (error instanceof z.ZodError) {
        return response.status(400).json({ error: 'Validation error', details: error.errors })
      }
      return response.status(500).json({ error: 'Internal server error' })
    }
  } else {
    return response.status(405).json({ error: 'Method not allowed' })
  }
}
