# jan (EduTrack)
> High-performance academic management infrastructure for automated grading and compliance tracking.

![language](https://img.shields.io/badge/language-TypeScript-blue) ![license](https://img.shields.io/badge/license-ISC-green) ![last commit](https://img.shields.io/github/last-commit/ayushjhaa1187-spec/jan) ![repo size](https://img.shields.io/github/repo-size/ayushjhaa1187-spec/jan)

> *"The(1) grading(2) pile(3) was(4) mountains(5) high.(6) Errors(7) in(8) calculation(9) were(10) inevitable,(11) and(12) teachers(13) were(14) exhausted.(15) Then(16) the(17) school(18) deployed(19) EduTrack.(20) One(21) portal.(22) One(23) upload.(24) The(25) results(26) calculated(27) perfectly,(28) report(29) cards(30) printed(31) in(32) seconds.(33) The(34) teachers(35) went(36) home(37) early.(38) It(39) worked.(40)"*

## WHAT THIS DOES
EduTrack (Jan) is an enterprise-level Examination Management System that solves the "Academic Overhead" problem for modern schools. It provides a full-lifecycle solution—from enrollment and subject assignment to complex auto-grading and PDF report card generation. Built with a robust TypeScript backend and Next.js 14 frontend, it ensures data integrity, security via RBAC, and real-time notifications for the academic community.

## TECH STACK
| Layer | Technology |
| :--- | :--- |
| Framework | Node.js (Express) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Validation | Zod |

## QUICK START
```bash
# 1. Clone
git clone https://github.com/ayushjhaa1187-spec/jan

# 2. Install
npm install

# 3. Setup Database & Run
npx prisma db push
npm run dev
```
Add: "Expected output: Server running at http://localhost:3000 and Prisma Client generated."

## FEATURES TABLE
| Feature | Why it matters |
| :--- | :--- |
| Exam Lifecycle | Automated workflow from draft → review → approved → published. |
| Bulk Marks Entry | High-speed data entry with Excel template support and validation. |
| Auto-Grading Engine | Sophisticated GPA and rank calculation logic with zero human error. |
| RBAC Security | Multi-role permission system (Admin, Teacher, Student, Parent). |
| Audit Trails | Full traceability of every modification to academic records for integrity. |

## HOW IT WORKS
```mermaid
graph TD
    User[User Login] --> Auth[JWT + RBAC Middleware]
    Auth --> APILayer[Express API Controllers]
    APILayer --> Validation[Zod Schema Check]
    Validation --> Service[Business Logic Layer]
    Service --> Prisma[Prisma ORM]
    Prisma --> DB[(PostgreSQL / Supabase)]
    Service --> Notify[Notification System]
```
The system follows a strict Service-Repository pattern. Every request is validated by Zod schemas before hitting the business logic layer. The engine uses Prisma ORM for type-safe PostgreSQL interactions. Exams and Marks follow a state-machine logic, ensuring that grades cannot be published until they pass the required administrative review cycles in the backend.

## PROJECT STRUCTURE
```
jan/
├── src/          # API controllers, business logic, and routing
├── prisma/       # Relational database schema and seed scripts
├── frontend/     # Next.js web application for teacher/admin portal
├── tests/        # Integration test suite for grading and auth
└── config/       # Environment variables and security configurations
```

## CONFIGURATION
```bash
# .env
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
JWT_SECRET="exam_system_primary_secret"
JWT_REFRESH_SECRET="exam_system_refresh_secret"
PORT=3000
```

## ROADMAP
| Feature | Status | Priority |
| :--- | :--- | :--- |
| Core Infrastructure | ✅ Done | High |
| Mobile Sync | 🔧 In Progress | Medium |
| AI Analytics | 📋 Planned | Low |

## CONTRIBUTING
We are looking for help with the parent-teacher communication bridge modules.
1. Fork → 2. Branch (`git checkout -b feat/your-contribution`) → 3. PR → 4. Review

## LICENSE + FOOTER
License: MIT
Built by ayushjhaa1187-spec · Give it a ⭐ if it helped you
