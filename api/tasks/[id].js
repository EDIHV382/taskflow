const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../../_lib/auth')

const prisma = new PrismaClient()

module.exports = async function handler(request, response) {
  const decoded = requireAuth(request, response)
  if (!decoded) return

  const { userId } = decoded
  const taskId = request.query.id

  if (!taskId) {
    return response.status(400).json({ error: 'Task ID is required' })
  }

  // Verify ownership
  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId },
  })

  if (!existing) {
    return response.status(404).json({ error: 'Task not found' })
  }

  // GET /api/tasks/[id]
  if (request.method === 'GET') {
    return response.status(200).json(existing)
  }

  // PUT /api/tasks/[id] — update task
  if (request.method === 'PUT') {
    try {
      const { title, description, priority, status, dueDate } = request.body

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(priority !== undefined && { priority }),
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        },
      })

      return response.status(200).json(updated)
    } catch (error) {
      console.error('Update task error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  // DELETE /api/tasks/[id]
  if (request.method === 'DELETE') {
    try {
      await prisma.task.delete({ where: { id: taskId } })
      return response.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete task error:', error)
      return response.status(500).json({ error: 'Internal server error' })
    }
  }

  return response.status(405).json({ error: 'Method not allowed' })
}
