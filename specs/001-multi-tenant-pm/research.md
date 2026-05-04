# Research: Multi-Tenant Project Management System

**Phase**: 0 (Pre-Design Research)  
**Date**: 2026-04-30

---

## 1. Multi-Tenant Database Architecture

### Decision: Row-Level Isolation with Tenant ID

**Approach**: Single shared schema with `tenant_id` column on all data tables. This is more operationally simple than schema-per-tenant while maintaining full logical isolation.

**Rationale**:

- Simpler backup/restore and migration strategy
- Single PostgreSQL instance scales to support many tenants
- Easier to implement tenant-id middleware at application layer
- Query-level isolation prevents accidental data leaks

**Alternatives Considered**:

- **Schema-per-tenant**: Provides physical isolation but requires complex connection pooling and migration management per schema
- **Database-per-tenant**: Maximum isolation but prohibitively expensive for resource management

**Implementation**:

- All tables have `tenant_id` NOT NULL column with foreign key to `tenants` table
- Database-level foreign key ON DELETE CASCADE for tenant deletion cascades to all dependent data
- Secondary indexes on `(tenant_id, status)` for efficient filtering
- Row-level policies via application middleware (no PostgreSQL RLS) for flexibility

---

## 2. Authentication & Authorization Strategy

### Decision: JWT + Role-Based Access Control (RBAC)

**Approach**: JWT tokens issued on login, decoded in middleware, roles checked per endpoint.

**Rationale**:

- Stateless, scalable authentication suitable for microservices
- Standard for REST APIs and well-supported in Next.js/Express eco system
- Role-based middleware can be reused across controllers

**Token Structure**:

```json
{
  "sub": "user_id",
  "tenant_id": "org_id",
  "roles": ["Developer", "QA Engineer", "Project Manager"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Roles**:

- **Developer**: Create/read/update own tasks, move tasks in workflow
- **QA Engineer**: Create/read/update QA tasks, move to QA stages
- **Project Manager**: All task operations, view analytics, manage team
- **Business Analyst**: Create/read tasks, can filter reports
- **Tenant Admin**: Manage projects, users, roles, quotas

**Alternatives Considered**:

- **OAuth/OpenID Connect**: Overkill for single-organization auth; JWT simpler for internal teams
- **Session cookies**: Requires server-side session store; JWT is simpler for distributed systems

---

## 3. Kanban Board UI Implementation

### Decision: React Beautiful DND or DND Kit

**Selection**: **DND Kit** (by Clauderic Artus)

**Rationale**:

- Modern, tree-shakeable library; ~10KB minified
- Better TypeScript support and accessibility (WCAG A)
- Supports nested drops and multi-container drag across columns
- Active development and large community adoption

**Alternatives Considered**:

- **React Beautiful DND**: Excellent UX but larger bundle (~35KB), less active maintenance post-Atlassian acquisition
- **Framer Motion + manual drag handling**: Too much custom code; dnd-kit abstracts the complexity

**Integration**: Next.js page wraps DND context provider; frontend service calls `/api/tasks/{id}/status` on drop.

---

## 4. Concurrent Updates & Optimistic Locking

### Decision: Version-Based Optimistic Locking

**Approach**: Add `version` integer column to `tasks` table; increment on every update. Client includes version in PATCH request; server rejects if version mismatch (HTTP 409 Conflict).

**Rationale**:

- No database locks; non-blocking for high concurrency
- User experiences immediate feedback; conflict is rare in practice
- Simpler than pessimistic locking and suitable for web UX

**Implementation**:

```typescript
// Backend: Check version before update
const existing = await db.query("SELECT version FROM tasks WHERE id = $1", [
  id,
]);
if (existing.version !== body.version) {
  throw new ConflictError("Task was modified; refresh and retry");
}
await db.query(
  "UPDATE tasks SET version = version + 1, status = $1 WHERE id = $2 AND version = $3",
  [newStatus, id, body.version],
);
```

---

## 5. Analytics Query Optimization

### Decision: Denormalization + Materialized Views

**Approach**:

- Pre-compute common aggregates (count by status, avg cycle time) into a `task_metrics` summary table
- Refresh on task updates via trigger or scheduled job
- Frontend queries summary table for dashboards

**Rationale**:

- Real-time calculations on millions of task rows is too slow
- Materialized views provide consistency without manual maintenance

**Queries to Optimize**:

- Task count by status per project
- Average time-in-stage per tenant (useful for identifying bottlenecks)
- Team velocity (tasks completed per sprint/week)

**Alternatives Considered**:

- **Real-time aggregation**: Acceptable for small datasets but doesn't scale
- **Elasticsearch**: Over-engineering for this use case; PostgreSQL window functions sufficient

---

## 6. REST API Pagination & Filtering

### Decision: Cursor-Based Pagination with Offset Limit as Fallback

**Approach**:

- Primary: Cursor-based pagination using task ID + sorting on `(tenant_id, status, created_at)`
- Fallback: Offset-limit for backward compatibility and simple one-off queries
- Default page size: 50 tasks (tunable per request)

**Endpoint Example**:

```
GET /api/projects/{project_id}/tasks?status=In%20Development&tenant_id={tenant_id}&cursor=task_502&limit=50
```

**Rationale**:

- Cursor pagination handles large datasets without server memory overhead
- Not affected by concurrent inserts/deletes
- Offset-limit acceptable for dashboards where dataset known to be small

---

## 7. Deployment & Containerization

### Decision: Docker Compose for Local Development; Kubernetes-Ready Production

**Approach**:

- Local dev: `docker-compose.yml` with postgres, backend, frontend services
- Production: Helm charts or cloud-native deployment (AWS ECS, GCP Cloud Run, Azure Container Instances)
- CI/CD: GitHub Actions or similar to build and push images to registry

**Dockerfile Strategy**:

- Backend: Multi-stage build (deps, build, runtime)
- Frontend: Multi-stage Next.js with node-slim base image
- Frontend dist cached; only app code invalidates layer cache

**Rationale**:

- Standardizes development environment across team
- Enables seamless local → staging → production promotion
- Infrastructure-agnostic (supports multiple cloud providers)

---

## 8. Testing Strategy

### Decision: Vitest + Jest Config + Supertest for API Tests

**Approach**:

- **Unit tests**: Vitest for fast iteration; services and utilities
- **Component tests**: React Testing Library for Next.js components
- **Integration tests**: Supertest for REST API endpoints with seeded test database
- **E2E tests**: Playwright or Cypress for critical user flows (optional; Phase 2+)

**Coverage Targets**:

- Services: ≥80% coverage (business logic)
- API routes: ≥70% coverage (endpoint behavior)
- Components: ≥60% coverage (UX behavior)

---

## 9. Logging & Monitoring

### Decision: Structured Logging + Observability Stack

**Approach**:

- Backend: Winston logger with JSON output for structured logs
- Frontend: Sentry + custom error boundary for crash reporting
- Observability: ELK Stack (Elasticsearch + Kibana) or managed service (DataDog, New Relic)

**Rationale**:

- Structured logs queryable for debugging multi-tenant interactions
- Error tracking essential for SaaS reliability

---

## 10. Security Best Practices

### Decision: Implement OWASP Top 10 Mitigations

**Key Controls**:

- **Injection**: Parameterized queries (no string concatenation)
- **Auth**: JWT + secure token storage (httpOnly cookies in production)
- **Sensitive Data Exposure**: HTTPS enforced in production; encryption at rest for secrets
- **CORS**: Whitelist frontend origin in backend
- **CSRF**: SameSite cookie flag; CSRF tokens for state-changing methods if using cookies
- **Access Control**: Tenant ID check on every data query; fail-open principle (deny by default)

---

## Summary of Decisions

| Topic         | Decision                             | Confidence                              |
| ------------- | ------------------------------------ | --------------------------------------- |
| Multi-tenancy | Row-level tenant_id isolation        | High                                    |
| Auth          | JWT + RBAC middleware                | High                                    |
| Kanban        | DND Kit library                      | High                                    |
| Concurrency   | Optimistic locking (version column)  | High                                    |
| Analytics     | Materialized views + denormalization | Medium (may optimize later)             |
| Pagination    | Cursor-based + offset fallback       | High                                    |
| Deployment    | Docker + K8s-ready                   | High                                    |
| Testing       | Vitest + RTL + Supertest             | High                                    |
| Monitoring    | Structured logging + Sentry          | Medium (MVP without full observability) |
| Security      | OWASP Top 10 compliance              | High                                    |

All unknowns from Technical Context section are now resolved. Ready for Phase 1 design.
