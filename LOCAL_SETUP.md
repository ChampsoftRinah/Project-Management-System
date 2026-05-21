# Local Setup Guide (Without Docker)

## Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** 12+ installed and running locally on port 5432
- **psql** command-line tool available

## Step 1: Create the Database

Open PowerShell or your PostgreSQL client and run:

```sql
CREATE DATABASE pm_system;
```

## Step 2: Create Tables

Run the migrations manually. Execute these SQL commands against the `pm_system` database:

```bash
psql -U postgres -d pm_system -f backend/src/database/migrations/001-tenants.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/002-users.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/003-user_roles.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/004-projects.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/005-tasks.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/006-task_history.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/007-task_comments.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/008-task_metrics.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/009-indexes.sql
psql -U postgres -d pm_system -f backend/src/database/migrations/010-audit_logs.sql
```

**OR** use the seed script (see Step 4).

## Step 3: Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Step 4: Seed Test Data

From the project root:

```bash
cd backend
npm run seed
```

This creates:

- **Tenant**: `tenant-001` (Test Organization)
- **User**: `admin@test.com` / password: `123456`
- **Roles**: Tenant Admin, Project Manager

## Step 5: Start the Backend

From `backend/` directory:

```bash
npm run dev
```

Expected output:

```
Backend server listening on port 3002
```

## Step 6: Start the Frontend (New Terminal)

From `frontend/` directory:

```bash
npm run dev
```

Expected output:

```
> pm-system-frontend@1.0.0 dev
> next dev -p 3001

> ▲ Next.js 18.x
  ▲ Local:        http://localhost:3001
```

## Step 7: Test the API

Use Postman or curl to test the login endpoint:

```bash
POST http://localhost:3002/api/v1/auth/login

{
  "email": "admin@test.com",
  "password": "123456",
  "tenant_id": "tenant-001"
}
```

Expected response:

```json
{
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "user-admin-001",
      "email": "admin@test.com",
      "first_name": "Admin",
      "last_name": "User",
      "tenant_id": "tenant-001",
      "roles": ["Tenant Admin", "Project Manager"]
    },
    "expires_in": 86400
  }
}
```

## Step 8: Access the Frontend

Open your browser to **http://localhost:3001** and log in with:

- Email: `admin@test.com`
- Password: `123456`
- Tenant ID: `tenant-001`

## Troubleshooting

### PostgreSQL connection fails

- Ensure PostgreSQL is running: `psql -U postgres` should connect
- Check `.env` file has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`
- Verify `pm_system` database exists: `psql -l | grep pm_system`

### "Password authentication failed for user postgres"

- This means PostgreSQL rejected the password in `.env`
- Verify your local PostgreSQL user `postgres` has password `rinah` (or update `.env`)
- Test: `psql -U postgres -h localhost -d pm_system`

### Table "users" does not exist

- Run the seed script: `npm run seed`
- OR manually create tables with the migration SQL files

### Port 3002 already in use

- Change `PORT=3002` in `.env` to another port (e.g., `PORT=3003`)
- Update frontend `.env` to point to the new backend port

## Next Steps

Once running locally:

1. Navigate to http://localhost:3001
2. Log in with test credentials
3. Create projects and tasks
4. Test the Kanban board drag/drop
5. View analytics dashboard
