import { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/prisma.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Check method
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const decoded = requireAuth(request, response);
  if (!decoded) return;

  const { userId } = decoded;

  try {
    // Get date ranges
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get tasks statistics
    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      completedThisWeek,
      completedThisMonth,
      completionTrend,
      productivityByDay,
    ] = await Promise.all([
      // Total tasks
      prisma.task.count({ where: { userId } }),

      // Pending tasks
      prisma.task.count({
        where: { userId, status: 'PENDING' },
      }),

      // In progress tasks
      prisma.task.count({
        where: { userId, status: 'IN_PROGRESS' },
      }),

      // Completed tasks
      prisma.task.count({
        where: { userId, status: 'COMPLETED' },
      }),

      // Overdue tasks
      prisma.task.count({
        where: {
          userId,
          status: { not: 'COMPLETED' },
          dueDate: { lt: today },
        },
      }),

      // Tasks by priority
      prisma.task.groupBy({
        by: ['priority'],
        where: { userId },
        _count: { priority: true },
      }),

      // Tasks by status
      prisma.task.groupBy({
        by: ['status'],
        where: { userId },
        _count: { status: true },
      }),

      // Completed this week
      prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: { gte: startOfWeek },
        },
      }),

      // Completed this month
      prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: { gte: startOfMonth },
        },
      }),

      // Completion trend (last 7 days)
      prisma.task.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'asc',
        },
      }),

      // Productivity by day of week
      prisma.task.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: {
            gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          updatedAt: true,
        },
      }),
    ]);

    // Calculate completion rate
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Format tasks by priority
    const priorityDistribution = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    tasksByPriority.forEach((item) => {
      priorityDistribution[item.priority as keyof typeof priorityDistribution] =
        item._count.priority;
    });

    // Format tasks by status
    const statusDistribution = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };
    tasksByStatus.forEach((item) => {
      statusDistribution[item.status as keyof typeof statusDistribution] =
        item._count.status;
    });

    // Calculate completion trend
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const completionTrendData = last7Days.map((date) => ({
      date,
      completed: completionTrend.filter(
        (t) => t.updatedAt.toISOString().split('T')[0] === date
      ).length,
    }));

    // Calculate productivity by day of week
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const productivityData = dayNames.map((day, index) => ({
      day,
      completed: productivityByDay.filter(
        (t) => new Date(t.updatedAt).getDay() === index
      ).length,
    }));

    return response.status(200).json({
      overview: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        completionRate,
      },
      weekly: {
        completedThisWeek,
        completedThisMonth,
      },
      distribution: {
        byPriority: priorityDistribution,
        byStatus: statusDistribution,
      },
      trends: {
        completionTrend: completionTrendData,
        productivityByDay: productivityData,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}
