# Todo App

A full-stack todo application with **Next.js** (frontend), **Express.js** (backend API), **PostgreSQL**, and **Prisma ORM**. Includes **Basic Authentication** so each user manages only their own tasks.

## Features

- User registration and login
- Basic Authentication (Base64 `username:password` in `Authorization` header)
- Per-user task CRUD (create, read, update, delete)
- Mark tasks complete with checkbox toggle
- Inline task editing (double-click or edit button)
- Toast notifications for all CRUD operations
- Loading, error, and empty states
- Light theme with responsive Tailwind CSS UI

## Project Structure

```
todo-app/
├── frontend/
│   ├── app/login/       # Login page
│   ├── app/register/    # Register page
│   ├── app/dashboard/   # Protected todo dashboard
│   └── components/
├── backend/
│   ├── src/routes/
│   ├── src/middleware/  # Basic auth middleware
│   └── src/controllers/
├── prisma/              # Schema and migrations
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) running locally or remotely

## Setup

### 1. Install dependencies

```bash
cd todo-app

cd backend
npm install
cd ..

cd frontend
npm install
cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `.env` and `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/todo_app?schema=public"
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Create the database

```sql
CREATE DATABASE todo_app;
```

### 4. Run Prisma migrations

From the **project root**:

```bash
npm run prisma:generate
npm run prisma:migrate
```

> **Note:** The auth migration clears existing tasks to add `userId`. Re-register users after upgrading.

### 5. Start the servers

**Terminal 1 — Backend (port 3001):**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (port 3000):**

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to login or dashboard.

## Authentication

### Register / Login (public)

| Method | Endpoint    | Body                              |
|--------|-------------|-----------------------------------|
| POST   | `/register` | `{ "username": "...", "password": "..." }` |
| POST   | `/login`    | `{ "username": "...", "password": "..." }` |

Passwords are hashed with **bcrypt** before storage.

### Protected task routes

All `/tasks` routes require:

```
Authorization: Basic base64(username:password)
```

Example: for user `john` / `secret123`:

```
Authorization: Basic am9objpzZWNyZXQxMjM=
```

The frontend stores credentials in `sessionStorage` and sends this header automatically.

## API Endpoints

| Method | Endpoint       | Auth     | Description              |
|--------|----------------|----------|--------------------------|
| POST   | `/register`    | No       | Create a new user        |
| POST   | `/login`       | No       | Validate credentials     |
| GET    | `/tasks`       | Basic    | Fetch current user's tasks |
| POST   | `/tasks`       | Basic    | Create a task            |
| PUT    | `/tasks/:id`   | Basic    | Update a task            |
| DELETE | `/tasks/:id`   | Basic    | Delete a task            |

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, Axios, react-hot-toast
- **Backend:** Node.js, Express.js, bcrypt
- **Database:** PostgreSQL
- **ORM:** Prisma

## Scripts

### Root

| Script                | Description           |
|-----------------------|-----------------------|
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate`  | Run dev migrations   |

### Backend (`backend/`)

| Script              | Description              |
|---------------------|--------------------------|
| `npm run dev`       | Start API with hot reload |
| `npm start`         | Start API in production   |

### Frontend (`frontend/`)

| Script          | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Build for production     |
