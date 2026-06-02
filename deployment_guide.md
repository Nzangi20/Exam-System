# Full-Stack Deployment and Hosting Guide
## Online Examination System (CDAM)

This comprehensive guide walks you through migrating from local development (SQLite/localhost) to a production-grade cloud environment.

---

## Architecture Overview
```mermaid
graph TD
    User([Student / Trainer]) -->|HTTPS| Frontend[Next.js App on Vercel]
    Frontend -->|API Requests| Backend[Node.js Express API on Render / Railway]
    Backend -->|Database Queries| Database[(Managed MySQL Database)]
```

---

## 1. Database Deployment (MySQL / phpMyAdmin)

For production, we recommend switching to a managed cloud MySQL database (e.g., **Aiven MySQL**, **phpMyAdmin-managed MySQL**, or **Render MySQL**).

### A. Switch Prisma to MySQL
1. Open `backend/prisma/schema.prisma`.
2. Locate the `datasource db` block and ensure the `provider` and `url` are configured as follows:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Locate your MySQL connection details from your hosting provider or phpMyAdmin:
   - Connection URL format: `mysql://<username>:<password>@<host>:<port>/<database_name>`
   - If using SSL (which is required by some providers like Aiven MySQL), append `?sslmode=required` or similar ssl parameters to the connection string:
     `mysql://<username>:<password>@<host>:<port>/<dbname>?ssl-mode=REQUIRED`

### B. Configure Connection Strings
You will need environment variables for Prisma:
* `DATABASE_URL`: The MySQL connection string configured with your credentials.

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
