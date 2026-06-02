# Leaders Among Us - Online Examination System

A modern, secure, and responsive full-stack online examination platform designed for educational institutions and corporate assessments.

**🚀 Live Demo:** [exam-system-nrna-git-main-nzangi20s-projects.vercel.app](https://exam-system-nrna-git-main-nzangi20s-projects.vercel.app) 

## Features

### Role-Based Access Control
- **Super Admin**: System configuration and oversight.
- **Trainer (Instructor)**: Create, manage, and grade exams. Monitor student progress.
- **Student (Candidate)**: Take exams in a secure environment and view results.

### Core Examination Engine
- Support for multiple question types (MCQ, True/False, Short Answer, Essay).
- Timed examinations with auto-submit functionality.
- Automatic grading for objective questions (MCQ, True/False).
- Dashboard analytics for both Trainers and Students.

### Security & Anti-Cheating
- **Strict Fullscreen Enforcement**: Exams must be taken in fullscreen mode.
- **Tab Monitoring**: Tracks and logs if a student switches tabs or minimizes the browser.
- **Shortcut Disabling**: Prevents copy/paste (`Ctrl+C`, `Ctrl+V`), right-clicking, and developer tools (`F12`).
- **Activity Logging**: All suspicious activities are logged and flagged for trainer review.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, TypeScript, Recharts, jsPDF, React Hook Form.
- **Backend**: Node.js, Express.js, Prisma ORM, SQLite (local development), JSON Web Tokens (JWT), Bcrypt.

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository** (if applicable) or navigate to the project directory.
2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided configuration (e.g. DATABASE_URL="file:./dev.db", JWT_SECRET="your_secret")
   npx prisma generate
   npx prisma db push
   npm run seed  # Generates sample users and an exam
   npm run dev   # Starts the backend server on port 5000
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev   # Starts the frontend server on port 3000
   ```


## Folder Structure

```text
Examsystem/
├── backend/
│   ├── prisma/             # Database schema and seed scripts
│   ├── src/
│   │   ├── controllers/    # Route controllers (auth, exam, questions, results)
│   │   ├── middlewares/    # Auth and security middlewares
│   │   ├── routes/         # Express API routes
│   │   └── server.js       # Express application entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/            # Next.js App Router pages (login, student, trainer)
    │   ├── components/     # Reusable UI components (AntiCheatWrapper)
    │   └── context/        # React Context (AuthContext)
    └── package.json
```

## Security Notice
The `AntiCheatWrapper` heavily restricts browser functionality. It is designed solely for the duration of the active examination. Do not wrap global application layouts with this component.

## Future Roadmap (MVP+)
- External proctoring API integration (Webcam monitoring).
- Payment gateways for premium certification exams.
- PostgreSQL migration for production deployment.
- Dockerization for scalable cloud hosting.
