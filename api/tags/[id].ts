import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';
import { updateTagSchema } from '../_lib/validators.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const decoded = requireAuth(request, response);
  if (!decoded) return;

  const { userId } = decoded;
  const { id } = request.query;

  if (!id || typeof id !== 'string') {
    return response.status(400).json({ error: 'Tag ID is required' });
  }

  // GET /api/tags/[id] — get a specific tag
  if (request.method === 'GET') {
    try {
      const tag = await prisma.tag.findFirst({
        where: { id, userId },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      });

      if (!tag) {
        return response.status(404).json({ error: 'Tag not found' });
      }

      const tagWithCount = {
        ...tag,
        taskCount: tag._count.tasks,
        _count: undefined,
      };

      return response.status(200).json(tagWithCount);
    } catch (error) {
      console.error('Get tag error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUT /api/tags/[id] — update a tag
  if (request.method === 'PUT') {
    try {
      // Check if tag exists and belongs to user
      const existingTag = await prisma.tag.findFirst({
        where: { id, userId },
      });

      if (!existingTag) {
        return response.status(404).json({ error: 'Tag not found' });
      }

      const validatedData = updateTagSchema.safeParse(request.body);

      if (!validatedData.success) {
        return response.status(400).json({
          error: 'Invalid input',
          details: validatedData.error.errors,
        });
      }

      const { name, color } = validatedData.data;

      // Check if new name conflicts with existing tag
      if (name && name.toLowerCase().trim() !== existingTag.name) {
        const conflictingTag = await prisma.tag.findUnique({
          where: {
            name_userId: {
              name: name.toLowerCase().trim(),
              userId,
            },
          },
        });

        if (conflictingTag) {
          return response.status(409).json({ error: 'Tag name already exists' });
        }
      }

      const tag = await prisma.tag.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: name.toLowerCase().trim() }),
          ...(color !== undefined && { color }),
        },
      });

      return response.status(200).json(tag);
    } catch (error) {
      console.error('Update tag error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // DELETE /api/tags/[id] — delete a tag
  if (request.method === 'DELETE') {
    try {
      // Check if tag exists and belongs to user
      const existingTag = await prisma.tag.findFirst({
        where: { id, userId },
      });

      if (!existingTag) {
        return response.status(404).json({ error: 'Tag not found' });
      }

      await prisma.tag.delete({
        where: { id },
      });

      return response.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Delete tag error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
