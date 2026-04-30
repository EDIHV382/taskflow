import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';
import { createTagSchema, updateTagSchema } from '../_lib/validators.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const decoded = requireAuth(request, response);
  if (!decoded) return;

  const { userId } = decoded;

  // GET /api/tags — list all tags for the user
  if (request.method === 'GET') {
    try {
      const tags = await prisma.tag.findMany({
        where: { userId },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      });

      // Transform to include taskCount
      const tagsWithCount = tags.map((tag) => ({
        ...tag,
        taskCount: tag._count.tasks,
        _count: undefined,
      }));

      return response.status(200).json(tagsWithCount);
    } catch (error) {
      console.error('Fetch tags error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/tags — create a new tag
  if (request.method === 'POST') {
    try {
      const validatedData = createTagSchema.safeParse(request.body);

      if (!validatedData.success) {
        return response.status(400).json({
          error: 'Invalid input',
          details: validatedData.error.issues,
        });
      }

      const { name, color } = validatedData.data;

      // Check if tag with same name already exists for this user
      const existingTag = await prisma.tag.findUnique({
        where: {
          name_userId: {
            name: name.toLowerCase().trim(),
            userId,
          },
        },
      });

      if (existingTag) {
        return response.status(409).json({ error: 'Tag already exists' });
      }

      const tag = await prisma.tag.create({
        data: {
          name: name.toLowerCase().trim(),
          color,
          userId,
        },
      });

      return response.status(201).json(tag);
    } catch (error) {
      console.error('Create tag error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
