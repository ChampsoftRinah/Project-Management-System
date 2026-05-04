# REST API Contracts: Multi-Tenant Project Management System

**Specification Version**: 1.0  
**Date**: 2026-04-30  
**Format**: OpenAPI 3.0 (simplified contract reference)

---

## API Base URL

```
https://{domain}/api/v1
```

All endpoints are scoped to the authenticated tenant via JWT token.

---

## Authentication

**Scheme**: Bearer JWT (HTTP Authorization header)

**Token Format**:

```json
{
  "sub": "user_id",
  "tenant_id": "tenant_id",
  "roles": ["Developer", "Project Manager"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Example Request Header**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Response Format

All errors return JSON with status code in 4xx or 5xx range:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Task with ID 'abc123' not found in tenant 'org-001'",
    "details": {
      "task_id": "abc123",
      "tenant_id": "org-001"
    }
  },
  "timestamp": "2026-04-30T12:00:00Z",
  "request_id": "req-uuid-string"
}
```

**Common Error Codes**:

- `UNAUTHORIZED`: Missing or invalid JWT
- `FORBIDDEN`: User lacks required role
- `RESOURCE_NOT_FOUND`: Entity does not exist
- `CONFLICT`: Version mismatch (optimistic locking)
- `VALIDATION_ERROR`: Invalid request body
- `INTERNAL_SERVER_ERROR`: Unexpected server error

---

## Authentication Endpoints

### POST /auth/login

**Purpose**: Authenticate user and issue JWT token

**Request**:

```json
{
  "email": "developer@org.com",
  "password": "securePassword123",
  "tenant_id": "org-001"
}
```

**Response** (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-001",
    "email": "developer@org.com",
    "first_name": "John",
    "last_name": "Doe",
    "roles": ["Developer", "QA Engineer"],
    "tenant_id": "org-001"
  },
  "expires_in": 86400
}
```

**Errors**:

- 401: Invalid credentials
- 404: User not found in tenant

---

### POST /auth/refresh

**Purpose**: Refresh expired JWT token

**Request**:

```json
{
  "refresh_token": "refresh-token-uuid"
}
```

**Response** (200 OK):

```json
{
  "token": "new-jwt-token-uuid",
  "expires_in": 86400
}
```

---

## Projects Endpoints

### GET /projects

**Purpose**: List all projects in tenant

**Query Parameters**:

- `limit`: Page size (default: 50, max: 200)
- `cursor`: Pagination cursor for next page
- `is_active`: Filter by status (true/false)

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "proj-uuid-001",
      "tenant_id": "org-001",
      "name": "Mobile App Redesign",
      "description": "Q2 2026 redesign initiative",
      "created_by": "user-uuid-001",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-25T14:30:00Z",
      "is_active": true
    }
  ],
  "pagination": {
    "cursor": "next-page-cursor-uuid",
    "has_more": true
  }
}
```

---

### POST /projects

**Purpose**: Create new project

**Request**:

```json
{
  "name": "Mobile App Redesign",
  "description": "Q2 2026 redesign initiative"
}
```

**Response** (201 Created):

```json
{
  "data": {
    "id": "proj-uuid-001",
    "tenant_id": "org-001",
    "name": "Mobile App Redesign",
    "description": "Q2 2026 redesign initiative",
    "created_by": "user-uuid-logged-in",
    "created_at": "2026-04-30T12:00:00Z",
    "updated_at": "2026-04-30T12:00:00Z",
    "is_active": true
  }
}
```

**Authorization**: Requires `Project Manager` or `Tenant Admin` role  
**Errors**: 403 Forbidden

---

## Tasks Endpoints

### GET /projects/{project_id}/tasks

**Purpose**: List tasks in a project (Kanban board data)

**Query Parameters**:

- `status`: Filter by status enum (Open, In Development, Ready for QA, etc.)
- `assignee_id`: Filter by assigned user ID
- `limit`: Page size (default: 50)
- `cursor`: Pagination cursor

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "task-uuid-001",
      "tenant_id": "org-001",
      "project_id": "proj-uuid-001",
      "title": "Implement user authentication",
      "description": "Add JWT-based login flow",
      "status": "In Development",
      "priority": "High",
      "assignee_id": "user-uuid-001",
      "assignee": {
        "id": "user-uuid-001",
        "email": "developer@org.com",
        "first_name": "John",
        "last_name": "Doe"
      },
      "reporter_id": "user-uuid-002",
      "labels": ["backend", "auth"],
      "version": 3,
      "created_at": "2026-04-15T08:00:00Z",
      "updated_at": "2026-04-28T16:45:00Z"
    }
  ],
  "pagination": {
    "cursor": "next-page-cursor-uuid",
    "has_more": false
  }
}
```

---

### POST /projects/{project_id}/tasks

**Purpose**: Create new task

**Request**:

```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based login flow",
  "status": "Open",
  "priority": "High",
  "assignee_id": "user-uuid-001",
  "labels": ["backend", "auth"]
}
```

**Response** (201 Created):

```json
{
  "data": {
    "id": "task-uuid-001",
    "tenant_id": "org-001",
    "project_id": "proj-uuid-001",
    "title": "Implement user authentication",
    "description": "Add JWT-based login flow",
    "status": "Open",
    "priority": "High",
    "assignee_id": "user-uuid-001",
    "reporter_id": "user-uuid-logged-in",
    "labels": ["backend", "auth"],
    "version": 1,
    "created_at": "2026-04-30T12:00:00Z",
    "updated_at": "2026-04-30T12:00:00Z"
  }
}
```

**Authorization**: Any authenticated user  
**Validation**: Title required, max 255 chars

---

### GET /projects/{project_id}/tasks/{task_id}

**Purpose**: Retrieve single task

**Response** (200 OK):

```json
{
  "data": {
    "id": "task-uuid-001",
    "tenant_id": "org-001",
    "project_id": "proj-uuid-001",
    "title": "Implement user authentication",
    "description": "Add JWT-based login flow",
    "status": "In Development",
    "priority": "High",
    "assignee_id": "user-uuid-001",
    "reporter_id": "user-uuid-002",
    "labels": ["backend", "auth"],
    "version": 3,
    "created_at": "2026-04-15T08:00:00Z",
    "updated_at": "2026-04-28T16:45:00Z"
  }
}
```

---

### PATCH /projects/{project_id}/tasks/{task_id}

**Purpose**: Update task (including status change for Kanban drag-and-drop)

**Request** (with optimistic locking):

```json
{
  "status": "Ready for QA",
  "priority": "Critical",
  "assignee_id": "user-uuid-002",
  "version": 3
}
```

**Response** (200 OK):

```json
{
  "data": {
    "id": "task-uuid-001",
    "tenant_id": "org-001",
    "project_id": "proj-uuid-001",
    "title": "Implement user authentication",
    "description": "Add JWT-based login flow",
    "status": "Ready for QA",
    "priority": "Critical",
    "assignee_id": "user-uuid-002",
    "reporter_id": "user-uuid-002",
    "labels": ["backend", "auth"],
    "version": 4,
    "created_at": "2026-04-15T08:00:00Z",
    "updated_at": "2026-04-30T13:15:00Z"
  }
}
```

**Errors**:

- 409 Conflict: Version mismatch (task was modified by another user)
  ```json
  {
    "error": {
      "code": "CONFLICT",
      "message": "Task version mismatch. Expected 3 but current version is 5. Please refresh and retry.",
      "current_version": 5
    }
  }
  ```
- 400 Bad Request: Invalid status transition

---

### DELETE /projects/{project_id}/tasks/{task_id}

**Purpose**: Delete task (soft-delete with audit trail)

**Request**:

```json
{
  "version": 3
}
```

**Response** (204 No Content)

**Authorization**: Requires `Project Manager` role or task reporter

---

## Task History Endpoints

### GET /projects/{project_id}/tasks/{task_id}/history

**Purpose**: Retrieve audit log for task

**Query Parameters**:

- `limit`: Page size (default: 50)
- `cursor`: Pagination cursor

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "history-uuid-001",
      "task_id": "task-uuid-001",
      "action": "status_changed",
      "changed_by": "user-uuid-001",
      "old_value": { "status": "In Development" },
      "new_value": { "status": "Development Completed" },
      "changed_at": "2026-04-28T16:45:00Z"
    },
    {
      "id": "history-uuid-002",
      "task_id": "task-uuid-001",
      "action": "assigned",
      "changed_by": "user-uuid-002",
      "old_value": { "assignee_id": null },
      "new_value": { "assignee_id": "user-uuid-001" },
      "changed_at": "2026-04-15T08:00:00Z"
    }
  ],
  "pagination": {
    "cursor": "next-page-cursor-uuid",
    "has_more": false
  }
}
```

---

## Analytics Endpoints

### GET /projects/{project_id}/analytics/summary

**Purpose**: Dashboard summary metrics

**Query Parameters**:

- `start_date`: ISO 8601 date (e.g., 2026-04-01)
- `end_date`: ISO 8601 date (default: today)

**Response** (200 OK):

```json
{
  "data": {
    "project_id": "proj-uuid-001",
    "date_range": {
      "start": "2026-04-01",
      "end": "2026-04-30"
    },
    "completion_rate": 0.72,
    "total_tasks": 50,
    "completed_tasks": 36,
    "avg_cycle_time_days": 3.5,
    "bottlenecks": [
      {
        "status": "In QA",
        "count": 8,
        "avg_time_hours": 48.0
      }
    ],
    "team_velocity": {
      "by_developer": [
        {
          "user_id": "user-uuid-001",
          "completed_tasks": 12,
          "avg_completion_time_hours": 18
        }
      ]
    }
  }
}
```

---

## Users & Roles Endpoints

### GET /users

**Purpose**: List team members in tenant

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "user-uuid-001",
      "tenant_id": "org-001",
      "email": "developer@org.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_active": true,
      "roles": ["Developer", "QA Engineer"],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-04-25T14:30:00Z"
    }
  ],
  "pagination": {
    "cursor": "next-page-cursor-uuid",
    "has_more": false
  }
}
```

**Authorization**: Requires `Project Manager` or `Tenant Admin` role

---

### POST /users/{user_id}/roles

**Purpose**: Assign role to user

**Request**:

```json
{
  "role": "Project Manager"
}
```

**Response** (201 Created):

```json
{
  "data": {
    "id": "user-uuid-001",
    "roles": ["Developer", "QA Engineer", "Project Manager"]
  }
}
```

**Authorization**: Requires `Tenant Admin` role

---

## Pagination Strategy

All list endpoints use **cursor-based pagination**:

```
GET /projects/{project_id}/tasks?limit=50&cursor=abc123def456
```

**Response**:

```json
{
  "data": [...],
  "pagination": {
    "cursor": "next-cursor-uuid",
    "has_more": true
  }
}
```

- No `cursor` parameter on first request
- Store `pagination.cursor` and use for next request
- When `has_more` is false, no more pages exist

---

## Rate Limiting

All endpoints enforce rate limits:

**Headers**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

**Limits**:

- 1,000 requests per hour per authenticated user
- 100 requests per minute for burst protection
- Status 429 Too Many Requests if exceeded

---

## Versioning

API version in URL: `/api/v1/...`

**Breaking Changes** require a new major version (`/api/v2/...`).

**Non-Breaking Changes** (new fields, new endpoints) do not require version bump.

---

## Summary

This REST API contract defines the public interface for the multi-tenant project management system. All endpoints enforce tenant isolation through JWT token scoping and database queries. Optimistic locking prevents concurrent update conflicts. Pagination uses cursor-based strategy for scalability. Error responses include request ID for debugging. Rate limiting protects against abuse.
