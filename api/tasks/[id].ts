import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';
import { updateTaskSchema } from '../_lib/validators.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const decoded = requireAuth(request, response);
  if (!decoded) return;

  const { userId } = decoded;
  const { id } = request.query;

  if (!id || typeof id !== 'string') {
    return response.status(400).json({ error: 'Task ID is required' });
  }

  // GET /api/tasks/[id] — get a specific task
  if (request.method === 'GET') {
    try {
      const task = await prisma.task.findFirst({
        where: { id, userId },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      if (!task) {
        return response.status(404).json({ error: 'Task not found' });
      }

      return response.status(200).json(task);
    } catch (error) {
      console.error('Get task error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /api/tasks/[id] — update a task
  if (request.method === 'PUT') {
    try {
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        return response.status(404).json({ error: 'Task not found' });
      }

      const validatedData = updateTaskSchema.safeParse(request.body);

      if (!validatedData.success) {
        return response.status(400).json({
          error: 'Invalid input',
          details: validatedData.error.issues,
        });
      }

      const { title, description, priority, status, dueDate, tagIds } = validatedData.data;

      // Verify tags belong to user if provided
      if (tagIds && tagIds.length > 0) {
        const userTags = await prisma.tag.findMany({
          where: {
            id: { in: tagIds },
            userId,
          },
          select: { id: true },
        });

        const validTagIds = userTags.map((t) => t.id);
        const invalidTagIds = tagIds.filter((id) => !validTagIds.includes(id));

        if (invalidTagIds.length > 0) {
          return response.status(400).json({
            error: 'Invalid tag IDs',
            details: `Some tags do not exist or do not belong to the user: ${invalidTagIds.join(', ')}`,
          });
        }
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...(title !== undefined && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(priority !== undefined && { priority }),
          ...(status !== undefined && { status }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(tagIds !== undefined && {
            tags: {
              set: tagIds.map((id) => ({ id })),
            },
          }),
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return response.status(200).json(task);
    } catch (error) {
      console.error('Update task error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /api/tasks/[id] — delete a task
  if (request.method === 'DELETE') {
    try {
      // Check if task exists and belongs to user
      const existingTask = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existingTask) {
        return response.status(404).json({ error: 'Task not found' });
      }

      await prisma.task.delete({
        where: { id },
      });

      return response.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Delete task error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
