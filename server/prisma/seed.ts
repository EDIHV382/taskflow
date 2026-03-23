import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Demo user credentials
  const demoEmail = 'example@gmail.com'
  const demoPassword = '123456'
  const demoName = 'Demo User'

  // Hash password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(demoPassword, 10)

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  })

  if (!existingUser) {
    // Create demo user
    const user = await prisma.user.create({
      data: {
        name: demoName,
        email: demoEmail,
        password: hashedPassword,
      },
    })

    console.log('✅ Demo user created:', demoEmail)

    // Create demo tasks for the user
    const demoTasks = [
      {
        title: '👋 Bienvenido a TaskFlow',
        description:
          'Esta es tu primera tarea de ejemplo. ¡Prueba el drag & drop en el tablero Kanban arrastrando esta tarea entre columnas!',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        title: '🎨 Explora el Dashboard',
        description:
          'Cambia entre vista grid y lista, prueba los filtros por estado y prioridad, y ordena las tareas por fecha o prioridad.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: '🌙 Prueba el Dark Mode',
        description:
          'Haz clic en el ícono de luna/sol en el header para alternar entre modo claro y oscuro. ¡La preferencia se guarda automáticamente!',
        priority: 'LOW',
        status: 'COMPLETED',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: '📱 Verifica el Diseño Responsivo',
        description:
          'Ajusta el tamaño del navegador para ver cómo la interfaz se adapta a móviles, tablets y escritorio.',
        priority: 'MEDIUM',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: '🚀 Comparte este Portfolio',
        description:
          'Este proyecto demuestra: React 18, TypeScript, Node.js, Express, Prisma, PostgreSQL, JWT Auth, Drag & Drop, y más.',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
    ]

    // Create tasks in database
    for (const task of demoTasks) {
      await prisma.task.create({
        data: {
          ...task,
          userId: user.id,
        },
      })
    }

    console.log('✅ Demo tasks created:', demoTasks.length)
  } else {
    console.log('ℹ️ Demo user already exists')
    
    // Update password hash to ensure it's correct
    await prisma.user.update({
      where: { email: demoEmail },
      data: { password: hashedPassword },
    })
    
    console.log('🔄 Password hash updated')
  }

  // Show demo user info
  const user = await prisma.user.findUnique({
    where: { email: demoEmail },
    include: { tasks: true },
  })

  if (user) {
    console.log('\n📋 Demo Credentials:')
    console.log('   Email: example@gmail.com')
    console.log('   Password: 123456')
    console.log(`   Tasks: ${user.tasks.length}`)
    console.log('\n')
  }
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
