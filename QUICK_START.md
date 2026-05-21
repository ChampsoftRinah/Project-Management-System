# Local Development Setup - No Docker Required

Your project is now ready to run locally without Docker!

## Quick Start (5 minutes)

### Option 1: Automated Setup (Windows)

```powershell
# From project root
.\setup.ps1
```

This script will:

- ✓ Check Node.js and PostgreSQL
- ✓ Create `.env` file
- ✓ Install dependencies
- ✓ Initialize database schema
- ✓ Seed test data

### Option 2: Manual Setup

1. **Ensure PostgreSQL is running** on localhost:5432
   - PostgreSQL should have a `postgres` user with password `rinah` (or update `.env`)

2. **From project root**, install all dependencies:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Initialize database schema**:

   ```bash
   cd backend
   npm run init-db
   ```

4. **Seed test data**:

   ```bash
   npm run seed
   ```

5. **Start the backend** (new terminal, from `backend/`):

   ```bash
   npm run dev
   ```

6. **Start the frontend** (new terminal, from `frontend/`):
   ```bash
   npm run dev
   ```

## Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3002
- **Login credentials**:
  - Email: `admin@test.com`
  - Password: `123456`
  - Tenant ID: `tenant-001`

## What Was Set Up

### New Scripts Added to `backend/package.json`

- `npm run init-db` - Creates all database tables
- `npm run seed` - Seeds test data (tenant, user, roles)
- `npm run setup` - Runs both init-db and seed in sequence

### New Files Created

- `.env` - Environment variables for local development
- `backend/scripts/init-db.ts` - Database schema initialization
- `backend/scripts/seed.ts` - Test data seeding
- `LOCAL_SETUP.md` - Detailed local setup guide
- `setup.ps1` - Automated Windows setup script

### Configuration Updates

- `backend/src/index.ts` - Added `dotenv/config` to load `.env` file

## Database Schema

The initialization script creates:

- **tenants** - Multi-tenant organization data
- **users** - User accounts with password hashes
- **user_roles** - Role assignments (Tenant Admin, Project Manager, etc.)
- **projects** - Projects within tenants
- **tasks** - Tasks within projects with workflow states
- **task_history** - Audit log of task changes
- **task_comments** - Comments on tasks
- **task_metrics** - Analytics data
- **audit_logs** - Full audit trail

## Test Data

After seeding, you'll have:

- **Tenant**: `tenant-001` (Test Organization)
- **User**:
  - ID: `user-admin-001`
  - Email: `admin@test.com`
  - Password: `123456` (stored as bcrypt hash)
- **Roles**: Tenant Admin, Project Manager

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Test connection from command line
psql -U postgres -h localhost -d pm_system

# If password fails, update .env with correct credentials
# and run init-db and seed again
```

### Port Already in Use

```bash
# Change PORT in .env
# E.g., PORT=3003
# Then restart the backend
```

### Tables Already Exist

```bash
# Safe to run init-db multiple times
# Uses CREATE TABLE IF NOT EXISTS
npm run init-db
```

### Missing Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Next Steps

1. ✅ Run local setup
2. ✅ Start backend and frontend
3. 🎯 Access http://localhost:3001
4. 📝 Create projects and tasks
5. 🎨 Test the Kanban board
6. 📊 View analytics dashboard

## Environment Variables

All configurable in `.env`:

```env
# Backend
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://postgres:rinah@localhost:5432/pm_system
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=rinah
DB_NAME=pm_system

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api/v1
```

Happy coding! 🚀
