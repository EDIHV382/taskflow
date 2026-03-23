import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  dueDate: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Access token missing' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
    
    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    
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
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Access token missing' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }
    
    // Parse body
    const body = await request.json()
    const validatedData = createTaskSchema.parse(body)
    
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
    
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
