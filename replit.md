# Unchi Udaan - Educational Learning Platform

## Overview
Unchi Udaan is a production-ready educational learning platform built for competitive exam preparation in India. The platform features multi-role access (Admin, Instructor, User), comprehensive course management, quiz system with time-based tests, job portal for government jobs, study materials, and current affairs content.

## Current State
**Phase**: Frontend Design Complete - Awaiting Approval

The frontend UI has been fully designed with all public pages, authentication flows, and role-based dashboards. The design follows a Razorpay-inspired modern theme with bright blue (#0066FF) as the primary color.

## Project Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Backend**: Express.js (API routes)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with Google OAuth + Email OTP (planned)
- **Payments**: Razorpay (planned)

### File Structure
```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx       # Main navigation with user menu
│   │   │   └── Footer.tsx       # Site footer with links
│   │   ├── cards/
│   │   │   ├── CourseCard.tsx   # Course display card
│   │   │   ├── QuizCard.tsx     # Quiz display card
│   │   │   ├── JobCard.tsx      # Job listing card
│   │   │   ├── StudyMaterialCard.tsx
│   │   │   ├── CurrentAffairCard.tsx
│   │   │   └── StatCard.tsx     # Dashboard stat card
│   │   ├── examples/            # Component usage examples
│   │   └── ui/                  # shadcn/ui components
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Theme (dark/light) state
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.tsx         # Landing page with hero
│   │   │   ├── Courses.tsx      # Course listing with filters
│   │   │   ├── Quizzes.tsx      # Quiz listing
│   │   │   ├── JobPortal.tsx    # Government jobs
│   │   │   ├── CurrentAffairs.tsx
│   │   │   ├── StudyMaterials.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx        # Login with Google OAuth
│   │   │   ├── Register.tsx     # Registration with validation
│   │   │   └── VerifyOtp.tsx    # Email verification
│   │   ├── user/
│   │   │   ├── UserDashboard.tsx
│   │   │   └── QuizAttempt.tsx  # Interactive quiz interface
│   │   ├── instructor/
│   │   │   └── InstructorDashboard.tsx
│   │   └── admin/
│   │       └── AdminDashboard.tsx
│   └── App.tsx                  # Main routing setup
server/
├── routes.ts                    # API routes (to be implemented)
├── storage.ts                   # Storage interface
└── db.ts                        # Database connection
shared/
└── schema.ts                    # Data models (to be implemented)
```

## Design Guidelines
- **Primary Color**: Blue (#0066FF / HSL 227 100% 50%)
- **Typography**: Inter for body, Plus Jakarta Sans for headings
- **Theme**: Light/Dark mode support with localStorage persistence
- **Cards**: White cards with subtle borders and hover effects
- **Hero Section**: Full-width with gradient overlay on images

## Features Implemented (Frontend)

### Public Pages
- [x] Home page with hero, features, courses, quizzes, testimonials
- [x] Courses listing with category/level/price filters
- [x] Quizzes listing with category/difficulty filters
- [x] Job Portal with department/location filters
- [x] Current Affairs with category/date filters
- [x] Study Materials with subject/category filters
- [x] About Us page with team and values
- [x] Contact page with form and FAQs

### Authentication
- [x] Login page with email/password and Google OAuth button
- [x] Register page with password strength validation
- [x] OTP verification page with 6-digit input
- [x] Protected routes based on user role

### Dashboards
- [x] User Dashboard with enrolled courses, quiz results, schedule
- [x] Instructor Dashboard with course/quiz management
- [x] Admin Dashboard with users, jobs, coupons management

### Quiz System
- [x] Interactive quiz interface with timer
- [x] Question navigation and flagging
- [x] Auto-submit on timeout
- [x] Results page with score breakdown

## Recent Changes
- Nov 30, 2024: Created complete frontend design prototype
- Nov 30, 2024: Added Razorpay-inspired blue theme
- Nov 30, 2024: Generated hero images for landing page
- Nov 30, 2024: Built all reusable card components
- Nov 30, 2024: Implemented auth context and theme context
- Nov 30, 2024: Created all public pages and dashboard pages

## Pending Backend Implementation
1. Database schema design with Drizzle ORM
2. Authentication with JWT + Google OAuth + Email OTP
3. Course CRUD operations
4. Quiz system with questions and results
5. Razorpay payment integration
6. File upload for study materials
7. PDF generation for quiz results
8. Job portal CRUD
9. Current affairs CRUD
10. User progress tracking

## User Preferences
- Production-level clean and optimized code
- Razorpay-inspired UI with bright blue theme
- Multi-role access (Admin, Instructor, User)
- All mock data marked with "//todo: remove mock functionality"

## Notes
- All mock data is temporary and marked for easy removal
- Backend routes are stubbed but not implemented
- Payment integration requires Razorpay API keys
- Google OAuth requires client credentials
