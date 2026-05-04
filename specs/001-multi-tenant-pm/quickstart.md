# Quick Start: Multi-Tenant Project Management System

**Feature**: 001-multi-tenant-pm  
**Date**: 2026-04-30

---

## Overview

This quick start guides developers through setting up and running the multi-tenant project management system locally for development and testing.

---

## Prerequisites

- **Docker & Docker Compose**: Local containerized development environment
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version && docker-compose --version`

- **Node.js 18+**: Backend and frontend runtimes
  - Download: https://nodejs.org/
  - Verify: `node --version && npm --version`

- **PostgreSQL client tools** (optional, for manual DB queries)
  - `psql` or use Docker container

---

## Local Development Setup (15 minutes)

### 1. Clone Repository

```bash
git clone <repo-url>
cd Project_Management_System
```

### 2. Start Docker Services

```bash
# Start PostgreSQL, backend, and frontend
docker-compose up -d
```

This launches:

- **PostgreSQL** on localhost:5432 (user: `pm_user`, password: `pm_password`, db: `pm_dev`)
- **Backend** on localhost:3000 (Node.js/Express API)
- **Frontend** on localhost:3001 (Next.js dev server)

### 3. Initialize Database

```bash
# Run migrations (alter the command based on your migration tool)
docker-compose exec backend npm run migrate
```

### 4. Seed Sample Data (Optional)

```bash
# Create sample tenant, users, and projects
docker-compose exec backend npm run seed
```

This creates:

- **Tenant**: "Acme Corp" (tenant_id: `acme-001`)
- **Users**: 3 developers + 1 QA engineer + 1 PM
- **Project**: "Mobile App v2.0"
- **Tasks**: 15 sample tasks across workflow stages

### 5. Access the Application

- **Frontend**: http://localhost:3001
- **API Docs**: http://localhost:3000/api/v1/docs (Swagger UI)
- **Database**: `localhost:5432` (PostgreSQL)

---

## First Task: Create a Project & Tasks

### Step 1: Login

1. Navigate to http://localhost:3001
2. Login with credentials:
   - Email: `pm@acme.com`
   - Password: `password123`
   - Tenant: `Acme Corp`

### Step 2: Create a Project

1. Click "New Project" button (top-right)
2. Enter:
   - Name: "Website Redesign"
   - Description: "Q2 2026 redesign initiative"
3. Click "Create"

### Step 3: Create Tasks

1. Navigate to the new project
2. Click "New Task" or use Kanban board "+" button
3. Enter:
   - Title: "Design homepage mockups"
   - Description: "High-fidelity designs in Figma"
   - Priority: High
   - Assignee: Select a developer
4. Click "Create"

### Step 4: Move Task on Kanban Board

1. In project view, locate the task card
2. Drag and drop from "Open" column → "Ready for Development"
3. Observe:
   - Task status updates in backend
   - Audit log records the change
   - Other users see the update in real-time (if using WebSockets, TBD)

---

## API Development & Testing

### Test Authentication Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@acme.com",
    "password": "password123",
    "tenant_id": "acme-001"
  }'
```

**Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...},
  "expires_in": 86400
}
```

### List Projects

```bash
TOKEN="<jwt-token-from-login>"

curl -X GET http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Create Task

```bash
curl -X POST http://localhost:3000/api/v1/projects/{project_id}/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Setup CI/CD pipeline",
    "description": "GitHub Actions workflow",
    "status": "Open",
    "priority": "High"
  }'
```

### Update Task Status (Kanban Drag-and-Drop)

```bash
curl -X PATCH http://localhost:3000/api/v1/projects/{project_id}/tasks/{task_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Ready for QA",
    "version": 3
  }'
```

---

## Running Tests

### Backend Unit Tests

```bash
docker-compose exec backend npm test
```

**Output**: Test coverage report for services, repositories, and middlewares

### Backend Integration Tests

```bash
docker-compose exec backend npm run test:integration
```

**Output**: API endpoint tests with seeded database

### Frontend Component Tests

```bash
docker-compose exec frontend npm test
```

**Output**: React component snapshot tests

### End-to-End Tests (Optional)

```bash
npm run test:e2e
```

Uses Playwright to test critical user flows.

---

## Database Access

### Connect via psql

```bash
psql -h localhost -U pm_user -d pm_dev -c "SELECT * FROM users LIMIT 5;"
```

**Credentials**:

- Host: `localhost:5432`
- User: `pm_user`
- Password: `pm_password`
- Database: `pm_dev`

### View Tasks in a Project

```bash
docker-compose exec backend psql -U pm_user -d pm_dev -c \
  "SELECT id, title, status FROM tasks WHERE tenant_id = 'acme-001' ORDER BY created_at DESC;"
```

---

## Common Development Tasks

### Add a New API Endpoint

1. Add route in `backend/src/api/routes/tasks.ts`
2. Implement controller in `backend/src/api/controllers/TaskController.ts`
3. Implement service logic in `backend/src/services/TaskService.ts`
4. Write unit tests in `backend/tests/unit/services/TaskService.test.ts`
5. Write integration tests in `backend/tests/integration/tasks.test.ts`
6. Restart backend: `docker-compose restart backend`

### Add a New Frontend Component

1. Create component file `frontend/src/components/NewComponent.tsx`
2. Import in parent page/component
3. Add unit test: `frontend/src/components/NewComponent.test.tsx`
4. Run hot-reload: `docker-compose exec frontend npm run dev` (already running)

### Run Database Migrations

```bash
docker-compose exec backend npm run migrate:latest
```

### Seed Additional Data

```bash
docker-compose exec backend npm run seed
```

---

## Debugging

### Backend Logs

```bash
docker-compose logs -f backend
```

### Frontend Logs

```bash
docker-compose logs -f frontend
```

### Database Logs

```bash
docker-compose logs -f postgres
```

### Attach Debugger (VS Code)

Backend `launch.json`:

```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach Backend",
  "port": 9229,
  "skipFiles": ["<node_internals>/**"]
}
```

Start backend with debugging:

```bash
docker-compose exec backend node --inspect=0.0.0.0:9229 index.js
```

---

## Troubleshooting

### Issue: Database Connection Refused

**Solution**:

```bash
# Check if PostgreSQL container is running
docker-compose ps

# Restart containers
docker-compose down && docker-compose up -d
```

### Issue: Port Already in Use (3000, 3001)

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process or change docker-compose port mapping
```

### Issue: JWT Token Expired

**Solution**: Login again to get fresh token, or implement token refresh endpoint.

### Issue: Task Status Not Persisting

**Solution**:

1. Check backend logs: `docker-compose logs backend`
2. Verify version field matches optimistic locking requirement
3. Check database: `psql -c "SELECT * FROM tasks WHERE id = '<task-id>'"`

---

## Next Steps

1. **Read Full Spec**: Review `/specs/001-multi-tenant-pm/spec.md` for detailed requirements
2. **Explore Data Model**: Review `/specs/001-multi-tenant-pm/data-model.md` for schema details
3. **API Integration**: Use `/specs/001-multi-tenant-pm/contracts/rest-api.md` for endpoint contract details
4. **Task Implementation**: See `/specs/001-multi-tenant-pm/tasks.md` for the complete task breakdown

---

## Support & Questions

- **Architecture**: Review `.specify/memory/constitution.md` for system principles
- **Research Decisions**: See `/specs/001-multi-tenant-pm/research.md` for rationale
- **Git Workflow**: Feature branch `001-multi-tenant-pm` follows conventional commit format
- **Code Review**: All PRs must pass linting, tests, and architecture review gates

---

## Environment Variables

**Backend** (`.env` or `docker-compose.yml`):

```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://pm_user:pm_password@postgres:5432/pm_dev
JWT_SECRET=local-dev-secret-key-not-for-production
JWT_EXPIRES_IN=86400s
```

**Frontend** (`.env.local`):

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_ENV=development
```

---

**Ready to start developing?** Run `docker-compose up` and head to http://localhost:3001! 🚀
