# Data Model: Multi-Tenant Project Management System

**Phase**: 1 (Design) | **Date**: 2026-04-30

---

## Entity-Relationship Overview

```
tenants (organizations)
  ├── users (team members, many-to-many via user_roles)
  │   └── user_roles (tenant_id, user_id, role)
  ├── projects (within each tenant)
  │   ├── tasks
  │   │   ├── task_assignments (task_id, user_id)
  │   │   ├── task_history (audit log for state changes)
  │   │   └── task_comments (discussion thread)
  │   └── project_settings
  └── analytics_snapshots (pre-computed metrics)
```

---

## Core Entities

### 1. **Tenants** (Organizations)

| Column     | Type         | Constraint              | Notes                                           |
| ---------- | ------------ | ----------------------- | ----------------------------------------------- |
| id         | UUID         | PK                      | Unique tenant identifier                        |
| name       | VARCHAR(255) | NOT NULL                | Organization name                               |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Creation timestamp                              |
| updated_at | TIMESTAMP    | NOT NULL, DEFAULT NOW() | Last update timestamp                           |
| is_active  | BOOLEAN      | NOT NULL, DEFAULT true  | Soft-delete flag                                |
| metadata   | JSONB        |                         | Custom tenant settings, branding, feature flags |

**Indexes**: pk, (is_active, created_at) for filtering active tenants

---

### 2. **Users**

| Column        | Type         | Constraint                | Notes                              |
| ------------- | ------------ | ------------------------- | ---------------------------------- |
| id            | UUID         | PK                        | Unique user identifier             |
| tenant_id     | UUID         | FK → tenants.id, NOT NULL | Multi-tenant isolation             |
| email         | VARCHAR(255) | NOT NULL                  | Unique within tenant               |
| password_hash | VARCHAR(255) | NOT NULL                  | Bcrypt hash (NEVER plaintext)      |
| first_name    | VARCHAR(100) |                           | User's first name                  |
| last_name     | VARCHAR(100) |                           | User's last name                   |
| is_active     | BOOLEAN      | NOT NULL, DEFAULT true    | Soft-delete; preserves audit trail |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Registration timestamp             |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Last profile update                |

**Unique Constraint**: (tenant_id, email)  
**Indexes**: pk, fk(tenant_id), (tenant_id, is_active), (tenant_id, email)

---

### 3. **User Roles** (Role-Based Access Control)

| Column      | Type      | Constraint                | Notes                                                                   |
| ----------- | --------- | ------------------------- | ----------------------------------------------------------------------- |
| id          | UUID      | PK                        |                                                                         |
| tenant_id   | UUID      | FK → tenants.id, NOT NULL | Multi-tenant scoping                                                    |
| user_id     | UUID      | FK → users.id, NOT NULL   | User receiving role                                                     |
| role        | ENUM      | NOT NULL                  | Developer, QA Engineer, Project Manager, Business Analyst, Tenant Admin |
| assigned_at | TIMESTAMP | NOT NULL, DEFAULT NOW()   | When role was assigned                                                  |
| assigned_by | UUID      | FK → users.id             | Audit trail of who assigned                                             |

**Unique Constraint**: (tenant_id, user_id, role) — no duplicate role assignments per user per tenant  
**Indexes**: pk, fk(tenant_id), fk(user_id), (tenant_id, role) for role-based filtering

---

### 4. **Projects**

| Column      | Type         | Constraint                | Notes                     |
| ----------- | ------------ | ------------------------- | ------------------------- |
| id          | UUID         | PK                        | Unique project identifier |
| tenant_id   | UUID         | FK → tenants.id, NOT NULL | Multi-tenant isolation    |
| name        | VARCHAR(255) | NOT NULL                  | Project name              |
| description | TEXT         |                           | Project summary           |
| created_by  | UUID         | FK → users.id             | Project creator (audit)   |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Creation timestamp        |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()   | Last update timestamp     |
| is_active   | BOOLEAN      | NOT NULL, DEFAULT true    | Soft-delete               |

**Indexes**: pk, fk(tenant_id), (tenant_id, is_active) for active project listing

---

### 5. **Tasks** (Core Entity)

| Column      | Type         | Constraint                 | Notes                                                                                                                          |
| ----------- | ------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| id          | UUID         | PK                         | Unique task identifier                                                                                                         |
| tenant_id   | UUID         | FK → tenants.id, NOT NULL  | Multi-tenant isolation                                                                                                         |
| project_id  | UUID         | FK → projects.id, NOT NULL | Owning project                                                                                                                 |
| title       | VARCHAR(255) | NOT NULL                   | Task title                                                                                                                     |
| description | TEXT         |                            | Detailed description                                                                                                           |
| status      | ENUM         | NOT NULL, DEFAULT 'Open'   | Workflow state (Open, Ready for Development, In Development, Development Completed, Ready for QA, In QA, QA Passed, QA Failed) |
| priority    | ENUM         | DEFAULT 'Medium'           | Low, Medium, High, Critical                                                                                                    |
| assignee_id | UUID         | FK → users.id, NULLABLE    | Currently assigned user                                                                                                        |
| reporter_id | UUID         | FK → users.id, NOT NULL    | User who created the task                                                                                                      |
| labels      | TEXT[] ARRAY |                            | Tags (e.g., ['bug', 'performance'])                                                                                            |
| version     | INT          | NOT NULL, DEFAULT 1        | Optimistic locking version                                                                                                     |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Creation timestamp                                                                                                             |
| updated_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW()    | Last update timestamp                                                                                                          |

**Indexes**: pk, fk(tenant_id), fk(project_id), fk(assignee_id), (tenant_id, status), (tenant_id, project_id, status) for efficient filtering and Kanban board queries

---

### 6. **Task History** (Audit Log)

| Column     | Type      | Constraint                | Notes                                                            |
| ---------- | --------- | ------------------------- | ---------------------------------------------------------------- |
| id         | UUID      | PK                        |                                                                  |
| tenant_id  | UUID      | FK → tenants.id, NOT NULL | Multi-tenant isolation                                           |
| task_id    | UUID      | FK → tasks.id, NOT NULL   | Audit record for task                                            |
| changed_by | UUID      | FK → users.id, NOT NULL   | User who made the change                                         |
| action     | ENUM      | NOT NULL                  | 'created', 'status_changed', 'assigned', 'reassigned', 'deleted' |
| old_value  | JSONB     |                           | Snapshot before change                                           |
| new_value  | JSONB     |                           | Snapshot after change                                            |
| changed_at | TIMESTAMP | NOT NULL, DEFAULT NOW()   | When the change occurred                                         |

**Indexes**: pk, fk(tenant_id), fk(task_id), (tenant_id, task_id, changed_at) for audit trail queries

---

### 7. **Task Comments** (Discussion Thread)

| Column     | Type      | Constraint                | Notes                            |
| ---------- | --------- | ------------------------- | -------------------------------- |
| id         | UUID      | PK                        |                                  |
| tenant_id  | UUID      | FK → tenants.id, NOT NULL | Multi-tenant isolation           |
| task_id    | UUID      | FK → tasks.id, NOT NULL   | Parent task                      |
| author_id  | UUID      | FK → users.id, NOT NULL   | Comment author                   |
| body       | TEXT      | NOT NULL                  | Comment text (supports markdown) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW()   | when posted                      |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW()   | Last edit                        |
| is_deleted | BOOLEAN   | DEFAULT false             | Soft-delete                      |

**Indexes**: pk, fk(tenant_id), fk(task_id), (tenant_id, task_id, created_at)

---

### 8. **Task Metrics** (Pre-Computed Analytics)

| Column               | Type          | Constraint                 | Notes                         |
| -------------------- | ------------- | -------------------------- | ----------------------------- |
| id                   | UUID          | PK                         |                               |
| tenant_id            | UUID          | FK → tenants.id, NOT NULL  | Multi-tenant isolation        |
| project_id           | UUID          | FK → projects.id, NOT NULL | Project scope                 |
| metric_date          | DATE          | NOT NULL                   | Date metrics computed for     |
| status               | ENUM          | NOT NULL                   | Task status                   |
| count                | INT           | NOT NULL                   | Number of tasks in status     |
| avg_cycle_time_hours | DECIMAL(10,2) |                            | Average hours spent in status |
| updated_at           | TIMESTAMP     | NOT NULL, DEFAULT NOW()    | Last refresh time             |

**Unique Constraint**: (tenant_id, project_id, metric_date, status)  
**Indexes**: pk, (tenant_id, project_id, metric_date) for dashboard queries

---

## State Machine: Task Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Task Workflow States                          │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                 OPEN (Initial State)                    │
    │         User/BA creates task, awaiting assignment       │
    └──────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │            READY FOR DEVELOPMENT                        │
    │     Task reviewed, assigned to dev, ready to work       │
    └──────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │              IN DEVELOPMENT                             │
    │     Developer actively working on task                  │
    └──────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │           DEVELOPMENT COMPLETED                         │
    │           Dev finished, awaiting QA                     │
    └──────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │             READY FOR QA                                │
    │           Waiting for QA engineer pickup                │
    └──────────────┬──────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────────────┐
    │                 IN QA                                   │
    │        QA testing in progress                           │
    └────────┬─────────────────────────────────┬──────────────┘
             │                                 │
        PASS │                                 │ FAIL
             │                                 │
             ▼                                 ▼
    ┌──────────────────┐        ┌──────────────────────────────┐
    │  QA PASSED       │        │     QA FAILED                │
    │ (Terminal State) │        │ Back to Dev Fix              │
    └──────────────────┘        └────────┬─────────────────────┘
                                         │
                                         ▼
                                  READY FOR DEVELOPMENT
                                  (Re-enter workflow)
```

**Transitions**:

- Manual transitions via Kanban drag-and-drop (authorized users only)
- `QA Passed` → terminal state (read-only task)
- `QA Failed` → return to `Ready for Development` state
- `Open` → Direct jump to any state (for admin/PM override)

---

## Validation Rules

| Entity       | Field       | Rule                                         | Reason                       |
| ------------ | ----------- | -------------------------------------------- | ---------------------------- |
| tasks        | title       | NOT NULL, max 255 chars                      | Require task summary         |
| tasks        | status      | Must be valid enum                           | State machine enforcement    |
| tasks        | assignee_id | If assigned, must be active user in tenant   | Prevent orphaned assignments |
| task_history | changed_by  | Must be active user                          | Audit trail integrity        |
| user_roles   | role        | Each user can have multiple roles            | E.g., PM + Developer         |
| projects     | tenant_id   | Foreign key constraint with ondelete cascade | Cleanup on tenant delete     |

---

## Performance Optimizations

### Indexes

```sql
-- Task filtering for Kanban (most critical)
CREATE INDEX idx_tasks_tenant_status ON tasks(tenant_id, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

-- User filtering within tenant
CREATE INDEX idx_users_tenant_active ON users(tenant_id, is_active);

-- Analytics refresh
CREATE INDEX idx_task_metrics_tenant_project_date ON task_metrics(tenant_id, project_id, metric_date);

-- Audit trail queries
CREATE INDEX idx_task_history_task ON task_history(task_id, changed_at);
```

### Foreign Keys with Cascading Deletes

```sql
ALTER TABLE users ADD CONSTRAINT fk_users_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE projects ADD CONSTRAINT fk_projects_tenant
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
```

---

## Multi-Tenant Isolation Enforcement

All queries **MUST** include `WHERE tenant_id = ?` clause:

```sql
-- ✅ CORRECT
SELECT * FROM tasks WHERE tenant_id = $1 AND status = 'Open';

-- ❌ INCORRECT - SECURITY RISK
SELECT * FROM tasks WHERE status = 'Open';
```

Backend middleware validates tenant_id header/JWT and injects into all repository queries.

---

## Summary

This data model enforces strict multi-tenant isolation at the database schema level while maintaining performance through indexed lookups and denormalized analytics. Role-based access control is schema-enforced (multiple rows per user), and audit trails are captured for all state changes. Optimistic locking prevents concurrent update conflicts. The structure supports current requirements and scales horizontally via tenant sharding when needed.
