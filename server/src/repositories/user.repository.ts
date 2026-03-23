import prisma from '../config/database.js'
import { User } from '@prisma/client'

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  async create(data: {
    name: string
    email: string
    password: string
  }): Promise<User> {
    return prisma.user.create({
      data,
    })
  }

  async update(id: string, data: {
    name?: string
    email?: string
    password?: string
  }): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  }
}
