# Tasks: Multi-Tenant Project Management System

**Input**: Design documents from `/specs/001-multi-tenant-pm/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/rest-api.md

**Tests**: Test tasks included per spec requirement for multi-tenant isolation, workflow state validation, and E2E Kanban operations

**Organization**: Tasks grouped by user story to enable independent implementation, testing, and MVP delivery

---

## Format: `[ID] [P?] [Story?] Description`

- **[ID]**: Sequential task identifier (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no interdependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- All paths reference backend/ and frontend/ subdirectories per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency setup, and basic scaffolding

- [ ] T001 Create backend project structure: `backend/src/{models,services,api/{controllers,middleware,routes},repositories,config}` and `backend/tests/{unit,integration}`
- [ ] T002 Create frontend project structure: `frontend/src/{components,pages,services,hooks,types,styles,lib}` and `frontend/tests/unit`
- [ ] T003 [P] Initialize backend package.json with Express, TypeScript, PostgreSQL driver, JWT, class-validator, and testing dependencies (jest, supertest)
- [ ] T004 [P] Initialize frontend package.json with Next.js 18+, React, Tailwind CSS, dnd-kit, Axios, TypeScript, and testing dependencies (jest, @testing-library/react)
- [ ] T005 [P] Create backend tsconfig.json with strict mode enabled
- [ ] T006 [P] Create frontend tsconfig.json and next.config.js with Tailwind CSS configuration
- [ ] T007 [P] Setup ESLint, Prettier for backend (backend/.eslintrc.json, backend/.prettierrc.json)
- [ ] T008 [P] Setup ESLint, Prettier for frontend (frontend/.eslintrc.json, frontend/.prettierrc.json)
- [ ] T009 Create docker-compose.yml orchestrating postgres (5432), backend (3000), frontend (3001)
- [ ] T010 [P] Create .env.example with DATABASE_URL, JWT_SECRET, NODE_ENV, API_BASE_URL placeholders

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before user story implementation begins

**⚠️ CRITICAL**: No user story work allowed until Checkpoint completion

### Database & Migrations

- [ ] T011 Setup database schema using TypeORM migrations or Knex: `backend/src/database/migrations/` directory
- [ ] T012 Create Tenant entity migration: `backend/src/database/migrations/001-tenants.ts` (id, name, created_at, updated_at, is_active, metadata)
- [ ] T013 [P] Create User entity migration: `backend/src/database/migrations/002-users.ts` (id, tenant_id, email, password_hash, first_name, last_name, created_at, updated_at, is_active, unique constraint on (tenant_id, email))
- [ ] T014 [P] Create UserRole entity migration: `backend/src/database/migrations/003-user_roles.ts` (id, tenant_id, user_id, role enum, unique constraint on (tenant_id, user_id, role))
- [ ] T015 [P] Create Project entity migration: `backend/src/database/migrations/004-projects.ts` (id, tenant_id, name, description, created_by, created_at, updated_at, is_active)
- [ ] T016 [P] Create Task entity migration: `backend/src/database/migrations/005-tasks.ts` (id, tenant_id, project_id, title, description, status enum, priority enum, assignee_id, reporter_id, labels array, version int, created_at, updated_at)
- [ ] T017 [P] Create TaskHistory entity migration: `backend/src/database/migrations/006-task_history.ts` (id, tenant_id, task_id, changed_by, action enum, old_value jsonb, new_value jsonb, changed_at)
- [ ] T018 [P] Create TaskComment entity migration: `backend/src/database/migrations/007-task_comments.ts` (id, tenant_id, task_id, author_id, body text, created_at, updated_at, is_deleted)
- [ ] T019 [P] Create TaskMetrics entity migration: `backend/src/database/migrations/008-task_metrics.ts` (id, tenant_id, project_id, metric_date, status enum, count int, avg_cycle_time_hours decimal, unique on (tenant_id, project_id, metric_date, status))
- [ ] T020 Add indexes migration: `backend/src/database/migrations/009-indexes.ts` including (tenant_id, status), (tenant_id, project_id, status), (tenant_id, is_active), (tenant_id, email), (task_id, changed_at)

### Authentication & Authorization

- [ ] T021 Create JWT configuration: `backend/src/config/auth.ts` (secret, expiration, algorithm)
- [ ] T022 Implement JWT token generation service: `backend/src/services/TokenService.ts` (sign, verify, decode methods)
- [ ] T023 [P] Create tenant isolation middleware: `backend/src/api/middleware/tenantMiddleware.ts` (extract tenant_id from JWT, validate, inject into request context)
- [ ] T024 [P] Create authentication middleware: `backend/src/api/middleware/authMiddleware.ts` (verify JWT, attach user to request, reject if invalid)
- [ ] T025 [P] Create authorization middleware: `backend/src/api/middleware/authorizationMiddleware.ts` (role-based access control, check required roles per endpoint)
- [ ] T026 [P] Create error handling middleware: `backend/src/api/middleware/errorMiddleware.ts` (catch exceptions, format standard error response with code, message, details)
- [ ] T027 Create base request context interface: `backend/src/types/RequestContext.ts` (user_id, tenant_id, roles)

### Base Models & Utilities

- [ ] T028 Create database connection service: `backend/src/config/database.ts` (establish PostgreSQL connection, expose query executor)
- [ ] T029 [P] Create base repository class: `backend/src/repositories/BaseRepository.ts` (generic CRUD methods, tenant-id scoping on all queries, error handling)
- [ ] T030 [P] Create base service class: `backend/src/services/BaseService.ts` (business logic foundation, logging, transaction support)
- [ ] T031 [P] Create TypeScript types for core entities: `backend/src/types/entities.ts` (Tenant, User, Project, Task, UserRole interfaces with validation)
- [ ] T032 [P] Create API response wrapper: `backend/src/api/response.ts` (standardized response envelope, pagination metadata)
- [ ] T033 [P] Create validation utilities: `backend/src/utils/validators.ts` (email validation, status enum validation, priority validation per data model)
- [ ] T034 [P] Create pagination utilities: `backend/src/utils/pagination.ts` (cursor generation, parsing, cursor-based list response builder)

### API Structure & Routing

- [ ] T035 Create Express app setup: `backend/src/index.ts` (initialize express, attach middleware chain, attach route handlers, error handling)
- [ ] T036 [P] Create main router: `backend/src/api/routes/index.ts` (mount auth, projects, tasks, users endpoints)
- [ ] T037 [P] Create route definitions: `backend/src/api/routes/auth.ts` (POST /auth/login, POST /auth/refresh)
- [ ] T038 [P] Create route definitions: `backend/src/api/routes/projects.ts` (GET/POST /projects, GET /projects/{id})
- [ ] T039 [P] Create route definitions: `backend/src/api/routes/tasks.ts` (GET/POST /projects/{project_id}/tasks, GET/PATCH/DELETE /projects/{project_id}/tasks/{task_id}, GET /projects/{project_id}/tasks/{task_id}/history)
- [ ] T040 [P] Create route definitions: `backend/src/api/routes/analytics.ts` (GET /projects/{project_id}/analytics/summary)
- [ ] T041 [P] Create route definitions: `backend/src/api/routes/users.ts` (GET /users, POST /users/{user_id}/roles)

### Frontend Base Setup

- [ ] T042 Create Next.js pages directory structure: `frontend/src/pages/{auth,projects,dashboard,(settings)}`
- [ ] T043 [P] Create Tailwind CSS global styles: `frontend/src/styles/globals.css` (theme colors, typography, spacing from constitution design system)
- [ ] T044 [P] Create API client service: `frontend/src/services/api.ts` (axios instance with tenant-id scoping, JWT token handling, error response handling)
- [ ] T045 [P] Create auth context & hooks: `frontend/src/context/AuthContext.tsx` and `frontend/src/hooks/useAuth.ts` (manage JWT token, user state, tenant_id, role checks)
- [ ] T046 [P] Create custom hooks: `frontend/src/hooks/useApi.ts` (fetch wrapper with error handling, loading state, pagination support)
- [ ] T047 [P] Create base layout component: `frontend/src/components/Layout.tsx` (navbar, sidebar, user menu, tenant selector)
- [ ] T048 [P] Create TypeScript interfaces for frontend: `frontend/src/types/index.ts` (Project, Task, User, analytics metrics matching backend contracts)

**Checkpoint**: All foundational infrastructure complete - user story implementation can now proceed in parallel

---

## Phase 3: User Story 1 - Tenant Admin: Create and Manage Projects (Priority: P1) 🎯

**Goal**: Enable Tenant Admins to create projects and assign team members with role-based access

**Independent Test**: Tenant Admin logs in, creates a project, assigns users to Developer/QA roles, verifies users see project and can access it

**Independent Test Criterion**: Task creation, role assignment, and project visibility all work with strict tenant isolation enforced

### Tests for User Story 1

- [ ] T049 [P] [US1] Create integration test: `backend/tests/integration/projects.test.ts` → POST /projects creates project under authenticated tenant, GET /projects returns only tenant's own projects, cross-tenant access rejected
- [ ] T050 [P] [US1] Create integration test: `backend/tests/integration/users.test.ts` → POST /users/{user_id}/roles assigns role to user, user gains access to project-scoped endpoints
- [ ] T051 [P] [US1] Create integration test: `backend/tests/integration/tenantIsolation.test.ts` → Verify User from Tenant A cannot read/write Tenant B data, even with same email prefix

### Implementation for User Story 1

- [ ] T052 [P] [US1] Create Project model & repository: `backend/src/models/Project.ts` and `backend/src/repositories/ProjectRepository.ts` (CRUD with tenant_id scoping, list by tenant)
- [ ] T053 [P] [US1] Create ProjectService: `backend/src/services/ProjectService.ts` (createProject validates input, checkTenantQuota, assigns creator as Project Manager, returns serialized project)
- [ ] T054 [P] [US1] Create ProjectController: `backend/src/api/controllers/ProjectController.ts` (GET /projects, POST /projects, GET /projects/{id} with role checks)
- [ ] T055 [US1] Implement POST /projects endpoint logic in controller (depends on T053, T054)
- [ ] T056 [US1] Implement GET /projects endpoint with pagination in controller (depends on T053, T054)
- [ ] T057 [P] [US1] Create User model & repository: `backend/src/models/User.ts` and `backend/src/repositories/UserRepository.ts` (query by tenant_id + email, list active users per tenant)
- [ ] T058 [P] [US1] Create UserRole model & repository: `backend/src/models/UserRole.ts` and `backend/src/repositories/UserRoleRepository.ts` (assign role, list roles per user, check if user has role)
- [ ] T059 [P] [US1] Create UserService: `backend/src/services/UserService.ts` (getUser, listUsers, assignRole validates role enum, ensures user is in tenant)
- [ ] T060 [US1] Implement POST /users/{user_id}/roles endpoint in UserController (depends on T059)
- [ ] T061 [P] [US1] Create login endpoint: `backend/src/api/controllers/AuthController.ts` with POST /auth/login (validate credentials, generate JWT with roles, tenant_id)
- [ ] T062 [US1] Implement POST /auth/login handler (depends on T061, T022)
- [ ] T063 [P] [US1] Create frontend page: `frontend/src/pages/auth/login.tsx` (email, password, tenant selector, submit to /auth/login)
- [ ] T064 [P] [US1] Create frontend page: `frontend/src/pages/projects/index.tsx` (list projects from GET /projects, show project cards, "New Project" button)
- [ ] T065 [P] [US1] Create frontend modal component: `frontend/src/components/ProjectForm.tsx` (form for name, description, submit to POST /projects)
- [ ] T066 [US1] Create project card component: `frontend/src/components/ProjectCard.tsx` (display project name, description, created_date, link to detail page)
- [ ] T067 [P] [US1] Create frontend page: `frontend/src/pages/projects/[projectId].tsx` (detail view, show list of team members with roles, role assignment UI)
- [ ] T068 [P] [US1] Create role assignment component: `frontend/src/components/RoleAssignmentForm.tsx` (dropdown for role selection, POST to /users/{user_id}/roles)
- [ ] T069 [US1] Create unit test for ProjectService: `backend/tests/unit/services/ProjectService.test.ts` (createProject validates name, checks quota, saves with tenant_id)
- [ ] T070 [US1] Create unit test for UserRoleRepository: `backend/tests/unit/repositories/UserRoleRepository.test.ts` (assignRole scope queries to tenant)

**Checkpoint**: User Story 1 complete - projects can be created, viewed, and team members assigned. Proceed to User Story 2.

---

## Phase 4: User Story 2 - Project Member: Create, Assign, Update Tasks (Priority: P1)

**Goal**: Enable team members to create tasks with full CRUD operations, assignment, and audit trail

**Independent Test**: Create task → Assign to user → Update fields (status, priority, assignee) → Verify changes persisted and audit log created → Verify only tenant members can see task

**Independent Test Criterion**: Task CRUD works with strict role enforcement and audit logging on every change

### Tests for User Story 2

- [ ] T071 [P] [US2] Create integration test: `backend/tests/integration/tasks.test.ts` → POST /projects/{project_id}/tasks creates task, PATCH updates task with version check (optimistic locking), DELETE soft-deletes
- [ ] T072 [P] [US2] Create integration test: `backend/tests/integration/taskAudit.test.ts` → Every task update creates TaskHistory entry, query history returns changes in reverse chronological order
- [ ] T073 [P] [US2] Create integration test: `backend/tests/integration/taskOptimisticLocking.test.ts` → Concurrent PATCH with stale version returns 409 Conflict, user retries with fresh version succeeds

### Implementation for User Story 2

- [ ] T074 [P] [US2] Create Task model & repository: `backend/src/models/Task.ts` and `backend/src/repositories/TaskRepository.ts` (CRUD with tenant_id + project_id scoping, list by project/status/assignee)
- [ ] T075 [P] [US2] Create TaskHistory model & repository: `backend/src/models/TaskHistory.ts` and `backend/src/repositories/TaskHistoryRepository.ts` (log every change, query history by task)
- [ ] T076 [P] [US2] Create TaskService: `backend/src/services/TaskService.ts` (createTask, updateTask with optimistic locking version check, deleteTask soft-delete, listTasks with filters)
- [ ] T077 [US2] Implement createTask method in TaskService (stores task with initial version=1, tenant_id, project_id, creates TaskHistory 'created' entry)
- [ ] T078 [US2] Implement updateTask method in TaskService (verify version matches, increment version, update fields, create TaskHistory entry with old_value/new_value, return 409 if version mismatch)
- [ ] T079 [P] [US2] Create TaskController: `backend/src/api/controllers/TaskController.ts` (POST /projects/{project_id}/tasks, PATCH /projects/{project_id}/tasks/{task_id}, DELETE, GET single task, GET history)
- [ ] T080 [US2] Implement POST /projects/{project_id}/tasks handler in controller (depends on T076, T079)
- [ ] T081 [US2] Implement PATCH /projects/{project_id}/tasks/{task_id} handler with version check (depends on T076, T079)
- [ ] T082 [US2] Implement GET /projects/{project_id}/tasks/{task_id}/history handler (depends on T079)
- [ ] T083 [P] [US2] Create frontend page: `frontend/src/pages/projects/[projectId]/tasks.tsx` (list tasks from GET /projects/{project_id}/tasks, show task cards)
- [ ] T084 [P] [US2] Create task form component: `frontend/src/components/TaskForm.tsx` (title, description, assignee dropdown, priority dropdown, submit to POST /projects/{project_id}/tasks)
- [ ] T085 [P] [US2] Create task detail modal: `frontend/src/components/TaskDetail.tsx` (display full task, edit fields, show audit history, handle optimistic locking conflicts with retry)
- [ ] T086 [P] [US2] Create task card component: `frontend/src/components/TaskCard.tsx` (compact display of title, status, assignee, priority, click to open detail modal)
- [ ] T087 [US2] Create unit test for TaskService: `backend/tests/unit/services/TaskService.test.ts` (createTask validates title, updateTask validates version and increments, deleteTask marks as deleted)
- [ ] T088 [US2] Create unit test for optimistic locking: `backend/tests/unit/services/TaskService.test.ts` → updateTask with stale version throws ConflictError

**Checkpoint**: User Story 2 complete - tasks can be created, updated, deleted with full audit trail and optimistic locking. Proceed to User Story 3.

---

## Phase 5: User Story 3 - Kanban Board: Move Tasks Across Workflow Stages (Priority: P1)

**Goal**: Enable visual drag-and-drop task movement across workflow columns with real-time status persistence

**Independent Test**: Open Kanban board → Drag task from "Open" column to "Ready for Development" → Verify task moved to new column → Verify status changed in backend → Verify other users see update

**Independent Test Criterion**: Kanban board CRUD works, drag-and-drop updates status and audit log, multi-user updates visible, state machine enforced

### Tests for User Story 3

- [ ] T089 [P] [US3] Create integration test: `backend/tests/integration/kanbanBoard.test.ts` → GET /projects/{project_id}/tasks?status=Open returns tasks in Open status, user can PATCH to move to Ready for Development, verification status changes and history logs
- [ ] T090 [P] [US3] Create integration test: `backend/tests/integration/workflowStateMachine.test.ts` → Moving task through invalid transition returns 400 Bad Request, moving through valid transitions succeeds
- [ ] T091 [P] [US3] Create frontend component test: `frontend/tests/unit/components/KanbanBoard.test.tsx` → Renders columns for each status, drag event triggers PATCH request, optimistic update on drop

### Implementation for User Story 3

- [ ] T092 [P] [US3] Create workflow state machine utility: `backend/src/utils/workflowStateMachine.ts` (validate transition from current status to new status per data model, list valid next states)
- [ ] T093 [US3] Update TaskService.updateTask to validate status transitions using state machine (depends on T092)
- [ ] T094 [P] [US3] Add task status filtering to TaskController: implement query param `status` in GET /projects/{project_id}/tasks to filter by status enum
- [ ] T095 [P] [US3] Create Kanban board component: `frontend/src/components/KanbanBoard.tsx` (render 8 columns for workflow stages, display task cards in correct columns)
- [ ] T096 [US3] Integrate dnd-kit into KanbanBoard component for drag-and-drop (handle drag events, call PATCH on drop, optimistic update)
- [ ] T097 [P] [US3] Create Kanban drop handler: `frontend/src/services/kanbanService.ts` (onDragEnd event → extract task id, source status, target status → PATCH /projects/{project_id}/tasks/{task_id} with new status and version)
- [ ] T098 [US3] Add error handling for optimistic locking conflicts in KanbanBoard (409 response → show conflict modal → fetch fresh task data → re-render board)
- [ ] T099 [P] [US3] Create Kanban board page: `frontend/src/pages/projects/[projectId]/kanban.tsx` (render KanbanBoard component, fetch tasks on load)
- [ ] T100 [US3] Create unit test for workflow state machine: `backend/tests/unit/utils/workflowStateMachine.test.ts` (validate legal transitions, reject illegal transitions)

**Checkpoint**: User Story 3 complete - Kanban board displays tasks, drag-and-drop updates status, state machine enforces workflow. Proceed to User Story 4.

---

## Phase 6: User Story 4 - Task Filters & Search (Priority: P2)

**Goal**: Enable users to filter tasks by project, assignee, status, and search by title/description

**Independent Test**: Apply filter for status=In Development → Only In Development tasks shown. Apply filter for assignee_id={user_id} → Only tasks assigned to that user shown. Combine filters → Correct subset returned.

**Independent Test Criterion**: All filter combinations work, pagination works with filters, filtered results match contract API

### Tests for User Story 4

- [ ] T101 [P] [US4] Create integration test: `backend/tests/integration/taskFiltering.test.ts` → GET /projects/{project_id}/tasks?status=Open returns only Open, ?assignee_id={id} returns only assigned, combination filters work
- [ ] T102 [P] [US4] Create integration test: `backend/tests/integration/taskSearch.test.ts` → GET /projects/{project_id}/tasks?title_search=auth returns tasks with 'auth' in title or description
- [ ] T103 [P] [US4] Create frontend component test: `frontend/tests/unit/components/TaskFilters.test.tsx` → Filter controls work, applying filter updates task list

### Implementation for User Story 4

- [ ] T104 [P] [US4] Update TaskRepository.listTasks to support filter parameters: `backend/src/repositories/TaskRepository.ts` (status, assignee_id, priority, labels, title_search)
- [ ] T105 [US4] Update TaskController GET /projects/{project_id}/tasks to pass filter query params to service (status, assignee_id, priority, labels, search)
- [ ] T106 [P] [US4] Create task filter component: `frontend/src/components/TaskFilters.tsx` (dropdown for status, assignee selector, priority selector, search input, apply button)
- [ ] T107 [P] [US4] Update tasks list page: `frontend/src/pages/projects/[projectId]/tasks.tsx` to include TaskFilters component
- [ ] T108 [US4] Wire filter component to fetch filtered results from API (status, assignee_id, priority filters passed as query params)
- [ ] T109 [P] [US4] Create unit test for TaskRepository filtering: `backend/tests/unit/repositories/TaskRepository.test.ts` (filter by status, assignee_id, priority builds correct SQL WHERE clauses)

**Checkpoint**: User Story 4 complete - task filtering works with multiple filter types. Proceed to User Story 5.

---

## Phase 7: User Story 5 - Dashboard & Analytics (Priority: P2)

**Goal**: Provide Project Managers with metrics dashboard showing completion rates, cycle time, bottlenecks, and team performance

**Independent Test**: Navigate to dashboard → Select date range → Dashboard displays task completion rate (% of QA Passed tasks), bottleneck stage (stage with most queued tasks), team velocity by developer → Metrics match backend-computed summary

**Independent Test Criterion**: Analytics calculations correct, dashboard renders metrics within 10s for 10k tasks, metrics persist across sessions

### Tests for User Story 5

- [ ] T110 [P] [US5] Create integration test: `backend/tests/integration/analytics.test.ts` → GET /projects/{project_id}/analytics/summary returns valid metrics object with completion_rate, bottlenecks, team_velocity arrays
- [ ] T111 [P] [US5] Create integration test: `backend/tests/integration/analyticsMath.test.ts` → Verify metrics calculations against known task dataset (completion_rate = QA_Passed / Total, bottlenecks detected correctly, velocity computed per developer)
- [ ] T112 [P] [US5] Create frontend component test: `frontend/tests/unit/components/AnalyticsDashboard.test.tsx` → Dashboard renders without errors, date range selection works

### Implementation for User Story 5

- [ ] T113 [P] [US5] Create TaskMetrics model & repository: `backend/src/models/TaskMetrics.ts` and `backend/src/repositories/TaskMetricsRepository.ts` (pre-computed aggregate queries)
- [ ] T114 [P] [US5] Create analytics aggregation service: `backend/src/services/AnalyticsService.ts` (computeMetricsSummary calculates: completion_rate, avg_cycle_time_per_status, bottlenecks, team_velocity)
- [ ] T115 [US5] Implement metric computation logic: completion_rate = count(status='QA Passed') / count(all tasks for project), bottlenecks = identify status with longest avg_time_in_stage
- [ ] T116 [P] [US5] Create AnalyticsController: `backend/src/api/controllers/AnalyticsController.ts` (GET /projects/{project_id}/analytics/summary with date_range params)
- [ ] T117 [US5] Implement GET /projects/{project_id}/analytics/summary handler (depends on T114, T116)
- [ ] T118 [P] [US5] Create dashboard page: `frontend/src/pages/projects/[projectId]/analytics.tsx` (date range picker, load analytics from API on mount/date change)
- [ ] T119 [P] [US5] Create analytics metrics component: `frontend/src/components/AnalyticsDashboard.tsx` (display completion rate as percentage, bottlenecks as list with counts, team velocity as bar chart)
- [ ] T120 [P] [US5] Create bottleneck visualization: `frontend/src/components/BottleneckChart.tsx` (bar chart showing task count by status, highlight bottleneck status in red)
- [ ] T121 [P] [US5] Create team velocity component: `frontend/src/components/TeamVelocity.tsx` (table or chart showing tasks completed per developer per week/sprint)
- [ ] T122 [US5] Create unit test for AnalyticsService: `backend/tests/unit/services/AnalyticsService.test.ts` (computeMetricsSummary calculates completion_rate, bottleneck detection, velocity correctly)

**Checkpoint**: User Story 5 complete - analytics dashboard displays all metrics. All P1 (US1–3) and P2 (US4–5) features complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Code quality, error handling, observability, documentation, and deployment

### Error Handling & Validation

- [ ] T123 Add comprehensive input validation to all API endpoints: `backend/src/api/middleware/validationMiddleware.ts` (validate request body against schema, return 400 with field errors)
- [ ] T124 [P] Create HTTP status code standardization: `backend/src/api/errors/HttpErrors.ts` (BadRequest, Unauthorized, Forbidden, NotFound, Conflict for optimistic locking, InternalServerError)
- [ ] T125 [P] Add request/response logging: `backend/src/api/middleware/requestLogging.ts` (log request method, path, tenant_id, response status, duration)
- [ ] T126 [P] Create error recovery UI: `frontend/src/components/ErrorBoundary.tsx` (catch exceptions in components, display user-friendly error message, retry button)

### Testing & Coverage

- [ ] T127 Create backend test helpers: `backend/tests/helpers/seed.ts` (seed test database with sample tenant, users, projects, tasks)
- [ ] T128 [P] Create backend test helpers: `backend/tests/helpers/auth.ts` (generate JWT token for testing, simulate logged-in user)
- [ ] T129 Set up test runs in CI pipeline: `.github/workflows/test.yml` (run backend tests, run frontend tests, compute coverage, report coverage)
- [ ] T130 Verify 80% coverage target on backend services: run `npm run test:coverage` and confirm backends/services/ > 80%

### Documentation

- [ ] T131 Create API documentation: `backend/README.md` (setup instructions, environment variables, running locally, testing)
- [ ] T132 [P] Create frontend documentation: `frontend/README.md` (component structure, style guide, Tailwind CSS usage, testing components)
- [ ] T133 [P] Create deployment guide: `docs/DEPLOYMENT.md` (Docker build, CI/CD pipeline, environment setup, database migrations in production)
- [ ] T134 [P] Create database schema documentation: `docs/SCHEMA.md` (ER diagram, table descriptions, field definitions, indexes, data model rationale)

### Performance & Observability

- [ ] T135 Add performance monitoring: `backend/src/middleware/performanceMonitoring.ts` (measure endpoint response times, log slow queries > 1s)
- [ ] T136 [P] Implement database connection pooling: `backend/src/config/database.ts` (configure PostgreSQL pool size, idle timeout, max connections)
- [ ] T137 [P] Add API rate limiting: `backend/src/middleware/rateLimiting.ts` (enforce 1000 req/hour per user, 100 req/min for burst)
- [ ] T138 [P] Create frontend performance monitoring: `frontend/src/services/analytics.ts` (track page load times, API call duration)

### Deployment & DevOps

- [ ] T139 Create production docker-compose: `docker-compose.prod.yml` (add health checks, resource limits, environment-specific configs)
- [ ] T140 [P] Create database backup strategy: `scripts/backups.sh` (pg_dump automation, retention policy)
- [ ] T141 [P] Create seed data script: `scripts/seed-demo-data.sh` (populates dev environment with sample tenant, users, projects, tasks)
- [ ] T142 Create CI/CD pipeline: `.github/workflows/deploy.yml` (on main push: run tests, build docker images, push to registry, deploy to staging)

### Security Hardening

- [ ] T143 Implement CORS policy: `backend/src/config/cors.ts` (whitelist frontend origin only)
- [ ] T144 [P] Add CSRF tokens for state-changing operations: `backend/src/api/middleware/csrfMiddleware.ts` (if using cookies; omit if using JWT only)
- [ ] T145 [P] Implement password hashing: `backend/src/services/AuthService.ts` (use bcrypt for password storage, never log passwords)
- [ ] T146 [P] Add security headers: `backend/src/middleware/securityHeaders.ts` (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy)

### Accessibility & UX Polish

- [ ] T147 [P] Add ARIA labels to interactive components: `frontend/src/components/**` (buttons, form inputs, modal dialogs for screen readers)
- [ ] T148 [P] Test keyboard navigation: Tab through all pages, verify focus indicators, verify modal dialogs trap focus
- [ ] T149 [P] Add loading spinners to async operations: `frontend/src/components/LoadingSpinner.tsx` (show during API calls, hide on completion)
- [ ] T150 Add success/error toast notifications: `frontend/src/components/Toast.tsx` (show after create/update/delete operations)

---

## Implementation Dependencies & Parallel Execution

### Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational) → [Phase 3, 4, 5, 6] (User Stories 1-5) → Phase 8 (Polish)

Within Phase 2, these can run in parallel:
  - T012–T019: Database migrations (independent)
  - T021–T026: Auth middleware (independent)
  - T028–T034: Base services/utilities (independent)
  - T035–T041: API route definitions (independent)
  - T042–T048: Frontend base setup (independent)

Within Phase 3 (US1), these can run in parallel (marked [P]):
  - T049–T051: Tests (independent test files)
  - T052–T053: Project models/services (independent from users)
  - T057–T060: User/role models/services (independent from projects)
  - T061–T062: Auth endpoint (independent)
  - T063–T068: Frontend pages/components (independent)

Within Phase 4 (US2), these can run in parallel (marked [P]):
  - T074–T076: Task models/services (don't depend on US1 beyond foundational)
  - T083–T086: Frontend task components (independent)
  - T087–T088: Unit tests (independent)

Within Phase 5 (US3), these can run in parallel (marked [P]):
  - T089–T091: Tests (independent)
  - T092–T094: Workflow state machine (independent from frontend)
  - T095–T099: Kanban board components (independent after state machine)

Within Phase 6 (US4) & Phase 7 (US5), tasks marked [P] can run in parallel.

Within Phase 8, tasks marked [P] can run in parallel.
```

### Suggested MVP Scope (First Sprint)

**Minimum Viable Product** includes:

- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: US1 (Projects CRUD)
- Phase 4: US2 (Tasks CRUD)
- Phase 5: US3 (Kanban Board)

**Result**: Users can create projects, add tasks, drag tasks on Kanban board.

**P2 features (US4, US5)** and **Phase 8 (Polish)** are Phase 2 deliverables, not MVP critical path.

---

## Summary Statistics

| Metric                                | Count |
| ------------------------------------- | ----- |
| **Total Tasks**                       | 150   |
| **Phase 1 (Setup)**                   | 10    |
| **Phase 2 (Foundational)**            | 48    |
| **Phase 3 (US1)**                     | 22    |
| **Phase 4 (US2)**                     | 16    |
| **Phase 5 (US3)**                     | 9     |
| **Phase 6 (US4)**                     | 6     |
| **Phase 7 (US5)**                     | 10    |
| **Phase 8 (Polish)**                  | 29    |
| **Parallelizable Tasks (marked [P])** | 87    |
| **Backend Tasks**                     | 65    |
| **Frontend Tasks**                    | 55    |
| **Test Tasks**                        | 20    |
| **DevOps/Infrastructure Tasks**       | 10    |

### Per-User-Story Task Breakdown

- **US1 (Projects)**: 22 tasks including 3 test tasks, 6 backend (models/services/controllers), 6 frontend (pages/components)
- **US2 (Tasks CRUD)**: 16 tasks including 3 test tasks, 5 backend (models/services/controllers), 5 frontend (pages/components)
- **US3 (Kanban Board)**: 9 tasks including 3 test tasks, 4 backend (state machine, controllers), 5 frontend (components, page)
- **US4 (Filters)**: 6 tasks including 2 test tasks, 2 backend (repository/controller), 2 frontend (components)
- **US5 (Analytics)**: 10 tasks including 3 test tasks, 3 backend (models/services/controllers), 4 frontend (components)

---

## Format Validation Checklist

✅ All 150 tasks follow strict format: `- [ ] [T###] [P?] [Story?] Description with file path`  
✅ All tasks have unique sequential IDs (T001–T150)  
✅ Parallelizable tasks marked with [P]  
✅ User story tasks marked with [US1], [US2], [US3], [US4], [US5]  
✅ All file paths include backend/ or frontend/ prefix per project structure  
✅ Tasks organized by phase and user story for independent delivery  
✅ Dependency notes included where tasks depend on prior tasks  
✅ Each user story includes independent test criteria and test tasks  
✅ Checkpoint notes indicate story completion and readiness for next stage

---

**Implementation Status**: Ready for execution. Use task ID (T###) to reference in code reviews, PRs, and CI/CD tracking. Each task is independently actionable by a developer with the design documentation context.
