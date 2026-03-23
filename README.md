# TaskFlow - Full-Stack Task Manager

TaskFlow es una aplicación web full-stack de gestión de tareas con autenticación JWT, diseñada para demostrar habilidades en desarrollo web moderno.

## 🚀 Demo en Vivo

**Frontend:** https://taskflow.vercel.app  
**Backend:** https://taskflow.onrender.com

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

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** - Database
- **PostgreSQL** - Neon Database
- **JWT** - Autenticación
- **Bcrypt** - Password hashing
- **Zod** - Request validation

### Infrastructure
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Neon** - PostgreSQL serverless

---

## 📁 Estructura

```
TaskFlow/
├── client/          # React frontend
├── server/          # Express backend
├── package.json     # Root package
└── README.md
```

---

## 🔐 API Endpoints

### Auth
- `POST /api/auth/login` - Login
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
git clone <repo-url>
cd taskflow
```

### 2. Instalar dependencias
```bash
npm run install:all
```

### 3. Configurar .env

**Server:**
```env
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"
JWT_ACCESS_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

**Client:**
```env
VITE_API_URL="http://localhost:5000"
```

### 4. Setup database
```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Iniciar
```bash
npm run dev
```

---

## 📦 Scripts

- `npm run dev` - Start both client & server
- `npm run build` - Build both projects
- `npm run install:all` - Install all dependencies

---

## 🚢 Deploy

### Vercel (Frontend)
1. Connect GitHub repo
2. Set `VITE_API_URL` env var
3. Auto-deploy on push

### Render (Backend)
1. Connect GitHub repo
2. Set env variables
3. Build: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start: `npm run start`

### Neon (Database)
1. Create project at neon.tech
2. Get connection string
3. Set `DATABASE_URL` in Render

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

---

## 📝 License

MIT

---

## 👨‍💻 Author

Full-stack developer portfolio project.

**Stack:** React, TypeScript, Node.js, Express, Prisma, PostgreSQL, JWT, TailwindCSS, Vite, Zustand
