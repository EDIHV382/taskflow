import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    })
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Parse body
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)
    
    // Update task
    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Update task error:', error)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    })
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Delete task
    await prisma.task.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json(null, { status: 204 })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { status } = z.object({
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    }).parse(body)
    
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: decoded.userId,
      },
    })
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Update status
    const task = await prisma.task.update({
      where: { id: params.id },
      data: { status },
    })
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Update status error:', error)
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
