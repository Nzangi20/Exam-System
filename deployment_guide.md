# Full-Stack Deployment and Hosting Guide
## Online Examination System (CDAM)

This comprehensive guide walks you through migrating from local development (SQLite/localhost) to a production-grade cloud environment.

---

## Architecture Overview
```mermaid
graph TD
    User([Student / Trainer]) -->|HTTPS| Frontend[Next.js App on Vercel]
    Frontend -->|API Requests| Backend[Node.js Express API on Render / Railway]
    Backend -->|Database Queries| Database[(Managed PostgreSQL on Supabase / Neon / Render)]
```

---

## 1. Database Deployment (PostgreSQL)

For production, we recommend switching from the local SQLite database to a managed cloud PostgreSQL database (e.g., **Supabase**, **Neon.tech**, or **Render PostgreSQL**).

### A. Switch Prisma to PostgreSQL
1. Open `backend/prisma/schema.prisma`.
2. Locate the `datasource db` block and update the `provider` and `url`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Create a managed PostgreSQL database on your chosen provider (e.g., [Supabase](https://supabase.com) or [Neon](https://neon.tech)) and copy the database connection string.

### B. Configure Connection Strings
You will need two environment variables for Prisma:
* `DATABASE_URL`: The direct transactional connection string (e.g. for querying).
* `DIRECT_URL`: (Optional, but required by providers like Supabase for migration pooling) The direct database connection string.

---

## 2. Backend Deployment (Express API Server)

You can host the Express backend on platforms like **Render**, **Railway**, or **Fly.io**.

### A. Environment Variables Required
Configure these variables in your hosting provider's dashboard:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The port the backend listens on | `5000` (handled dynamically by Render) |
| `DATABASE_URL` | Cloud PostgreSQL connection string | `postgresql://user:pass@host:port/dbname` |
| `JWT_SECRET` | Strong secret key for signing user sessions | *Generate a secure random string* |
| `FRONTEND_URL` | URL of your deployed Next.js frontend | `https://examsystem-frontend.vercel.app` |

### B. Deployment Steps (e.g., Render)
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your Git repository containing the `backend` folder.
3. Configure the service settings:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate`
   * **Start Command**: `node src/server.js`
4. In the **Environment** tab, add all variables listed in Section 2A.
5. Click **Deploy Web Service**. Render will build and deploy the API server. Copy your web service's live URL (e.g., `https://examsystem-backend.onrender.com`).

### C. Run Database Migrations
Once your database is online and the backend env is configured:
1. In your local terminal under the `backend` directory, set the production `DATABASE_URL` environment variable.
2. Run the Prisma migration script to set up all tables and relations:
   ```bash
   npx prisma migrate deploy
   ```

---

## 3. Frontend Deployment (Next.js)

The Next.js frontend is optimized for zero-config deployment on **Vercel**.

### A. Environment Variables Required
Configure this variable in your Vercel project dashboard:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | The public URL of your deployed backend service | `https://examsystem-backend.onrender.com` |

### B. Deployment Steps
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Connect your Git repository.
3. In the project setup, select the **Root Directory** as `frontend`.
4. Vercel automatically detects the Next.js framework. Under the **Environment Variables** section, add:
   * **Key**: `NEXT_PUBLIC_API_URL`
   * **Value**: *Your backend web service URL* (e.g., `https://examsystem-backend.onrender.com`)
5. Click **Deploy**. Vercel will build and host your Next.js application.

---

## 4. Post-Deployment Verification Checklist

- [ ] **SSL Security**: Verify both frontend and backend are running securely over `https://`.
- [ ] **User Authentication**: Register a new student, sign out, and sign back in to confirm JWT auth is functioning correctly.
- [ ] **Cross-Origin Requests (CORS)**: Confirm that the frontend can fetch exam statistics and data from the backend without any console errors.
- [ ] **Exam & Question Creation**: Log in as a Trainer and create an exam with dynamic questions. Confirm it updates and persists.
- [ ] **Materials Upload**: Test uploading a revision document or slide. Verify it saves and can be downloaded by students.
