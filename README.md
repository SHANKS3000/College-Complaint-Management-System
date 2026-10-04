# Campus Care: College Complaint Management System

A beginner-friendly full-stack complaint portal built with HTML, CSS, vanilla JavaScript, Node.js, Express, and MySQL. The Express server also serves the frontend, so local development needs one port and no XAMPP or PHP.

## Requirements

- Node.js LTS and npm
- MySQL Server and MySQL Workbench

## Windows setup

1. Install Node.js LTS from the official Node.js website. Check it:

```powershell
node --version
npm --version
```

2. Install MySQL Community Server. During setup, remember the root password. Open MySQL Workbench and connect to the local MySQL instance.

3. In Workbench, open `database/schema.sql`, execute the whole script, and refresh the Schemas panel.

4. Create the environment file by copying the template:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DB_PASSWORD` plus a private `SESSION_SECRET`. To enable complaint status emails, also set the SMTP values (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) and a sender address (`EMAIL_FROM`) using your email provider's settings. Set `FRONTEND_URL` to the public portal URL when deploying. Keep these credentials private; `.env` is ignored by Git.

5. Install dependencies and start the server:

```powershell
npm install
npm start
```

6. Open http://localhost:3000 in a browser.

## Creating an admin

Generate a bcrypt password hash using this one-time command from `backend`:

```powershell
node -e "require('bcrypt').hash('ChangeMe123!', 12).then(console.log)"
```

Copy the output into this Workbench query, replacing the hash:

```sql
USE college_complaint_management;
INSERT INTO admins (name, email, password, department)
VALUES ('Portal Admin', 'admin@college.edu', 'PASTE_BCRYPT_HASH_HERE', 'Administration');
```

Use the email and original password at `/admin-login.html`.

## Major files

- `backend/server.js`: Express app, sessions, static frontend hosting, and routes.
- `backend/routes/`: REST endpoint definitions.
- `backend/controllers/`: validation, database queries, and complaint workflows.
- `backend/middleware/authMiddleware.js`: student/admin route protection.
- `backend/config/db.js`: MySQL connection pool using `.env` values.
- `database/schema.sql`: database, tables, relationships, indexes, and status enum.
- `frontend/js/app.js`: shared API helper, session checks, navigation, and status badges.
- `frontend/*.html`: landing, auth, student, complaint detail, and admin screens.

## REST API summary

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/complaints` (admin), `POST /api/complaints` (student), `GET /api/complaints/:id`
- `PUT /api/admin/complaints/:id/status`, `POST /api/admin/complaints/:id/remarks`, `DELETE /api/admin/complaints/:id`
- `GET /api/admin/complaints`, `GET /api/admin/dashboard`

Passwords are bcrypt-hashed, sessions are HTTP-only, uploads accept only JPG/PNG/PDF up to 5 MB, and SQL uses parameterized queries.
