# EduTrack — Examination Management System

A production-grade school examination management system built with Node.js, TypeScript, PostgreSQL, and Next.js 14.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | JWT + Refresh Tokens |
| Validation | Zod |
| Frontend | Next.js 14 + Tailwind CSS |
| Docs | Swagger |
| Tests | Jest |

## Modules

- Auth — JWT authentication, RBAC, refresh tokens
- Students — CRUD, pagination, class transfer
- Classes — Class management
- Subjects — Subject management
- Teachers — Teacher profiles, subject assignments
- Exams — Full lifecycle: DRAFT → REVIEW → APPROVED → PUBLISHED
- Marks — Entry, bulk upload, Excel template
- Results — Auto-calculation, grading, report cards
- Reports — PDF generation, charts
- Notifications — Real-time notification system
- Audit Log — Full activity tracking

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (or Supabase)

### Installation
```bash
# Install backend dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# Push database schema
npx prisma db push

# Start backend
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

Backend deployed at: https://jan-two.vercel.app
