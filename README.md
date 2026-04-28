# TaskFlow - Full-Stack Task Manager

TaskFlow es una aplicación web full-stack de gestión de tareas con autenticación JWT, deployada en **Vercel** como serverless functions.

## 🚀 Demo en Vivo

**URL:** [https://taskflow.vercel.app](https://taskflow-ruby-three.vercel.app/)

### Credenciales Demo

```
Email:    example@gmail.com
Password: 123456
```

El botón "⚡ Autocompletar Demo" en el login completa las credenciales automáticamente.

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilos con dark mode
- **Zustand** - Estado global
- **Axios** - HTTP client
- **React Hook Form** + **Zod** - Validación
- **@dnd-kit** - Drag and drop
- **React Hot Toast** - Notificaciones

### Backend (Serverless)
- **Vercel Functions** (Node.js)
- **Prisma ORM** - Database
- **PostgreSQL** - Neon Database
- **JWT** - Autenticación
- **Bcrypt** - Password hashing
- **Zod** - Request validation

### Infrastructure
- **Vercel** - Hosting (frontend + backend)
- **Neon** - PostgreSQL serverless

---

## 📁 Estructura

```
TaskFlow/
├── api/              # Vercel serverless functions
│   ├── auth/         # Auth endpoints
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   ├── refresh.ts
│   │   └── me.ts
│   └── tasks/        # Task endpoints
│       ├── index.ts
│       └── [id].ts
├── client/           # React frontend
├── vercel.json       # Vercel config
└── package.json
```

---

## 🔐 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (disabled)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update status

---

## 🗄️ Database Schema

### User
- id, name, email, password
- createdAt, updatedAt

### Task
- id, title, description, priority, status, dueDate, userId
- createdAt, updatedAt

### RefreshToken
- id, token, userId, expiresAt

---

## 🛠️ Instalación Local

### 1. Clonar repo
```bash
git clone https://github.com/EDIHV382/taskflow.git
cd taskflow
```

### 2. Instalar dependencias
```bash
npm install
cd client && npm install
cd ..
```

### 3. Configurar .env

**Root:**
```env
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
```

**Client:**
```env
VITE_API_URL="http://localhost:3000"
```

### 4. Setup database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Iniciar local
```bash
vercel dev
```

O solo el frontend:
```bash
cd client && npm run dev
```

---

## 🚀 Deploy en Vercel

### 1. Conectar GitHub
- Ve a vercel.com
- Importa tu repo de GitHub
- Auto-detecta Vercel + React

### 2. Variables de entorno
En Vercel dashboard:
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### 3. Deploy
```bash
vercel --prod
```

O desde la UI de Vercel.

---

## ✨ Features

- ✅ Login con JWT auth
- ✅ CRUD completo de tareas
- ✅ Kanban board con drag & drop
- ✅ Filtros por estado y prioridad
- ✅ Dark mode toggle
- ✅ Responsive design
- ✅ Modo demo con datos temporales
- ✅ Credenciales demo visibles
- ✅ Serverless architecture

---

## 📝 License

MIT

---

## 👨‍💻 Author

Full-stack developer portfolio project.

**Stack:** React, TypeScript, Vercel, Prisma, PostgreSQL, JWT, TailwindCSS, Zustand
