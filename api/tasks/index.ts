import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';
import { createTaskSchema, paginationSchema } from '../_lib/validators.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const decoded = requireAuth(request, response);
  if (!decoded) return;

  const { userId } = decoded;

  // GET /api/tasks — list all tasks for the user (with pagination and filters)
  if (request.method === 'GET') {
    try {
      // Parse query parameters
      const queryParams = {
        page: request.query.page,
        limit: request.query.limit,
        search: request.query.search,
        status: request.query.status,
        priority: request.query.priority,
        tagId: request.query.tagId,
      };

      const validatedQuery = paginationSchema.safeParse(queryParams);

      if (!validatedQuery.success) {
        return response.status(400).json({
          error: 'Invalid query parameters',
          details: validatedQuery.error.issues,
        });
      }

      const { page, limit, search, status, priority, tagId } = validatedQuery.data;

      // Build where clause
      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (priority) {
        where.priority = priority;
      }

      if (tagId) {
        where.tags = {
          some: { id: tagId },
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get total count
      const total = await prisma.task.count({ where });

      // Get tasks with pagination and include tags
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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

      const totalPages = Math.ceil(total / limit);

      return response.status(200).json({
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
      });
    } catch (error) {
      console.error('Fetch tasks error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/tasks — create a new task
  if (request.method === 'POST') {
    try {
      const validatedData = createTaskSchema.safeParse(request.body);

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

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          priority,
          status,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
          ...(tagIds && tagIds.length > 0 && {
            tags: {
              connect: tagIds.map((id) => ({ id })),
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

      return response.status(201).json(task);
    } catch (error) {
      console.error('Create task error:', error);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
