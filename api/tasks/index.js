const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../_lib/auth')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  const decoded = requireAuth(request, response)
  if (!decoded) return

  const { userId } = decoded

  // GET /api/tasks — list all tasks for the user
  if (request.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      return response.status(200).json(tasks)
    } catch (error) {
      console.error('Fetch tasks error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  // POST /api/tasks — create a new task
  if (request.method === 'POST') {
    try {
      const { title, description, priority, status, dueDate } = request.body

      if (!title || title.trim() === '') {
        return response.status(400).json({ error: 'Title is required' })
      }

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          priority: priority || 'MEDIUM',
          status: status || 'PENDING',
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
        },
      })

      return response.status(201).json(task)
    } catch (error) {
      console.error('Create task error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
