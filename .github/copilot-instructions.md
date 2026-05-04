<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:

**Implementation Plan**: [specs/001-multi-tenant-pm/plan.md](../specs/001-multi-tenant-pm/plan.md)

Supporting Artifacts:

- **Feature Spec**: [specs/001-multi-tenant-pm/spec.md](../specs/001-multi-tenant-pm/spec.md)
- **Data Model**: [specs/001-multi-tenant-pm/data-model.md](../specs/001-multi-tenant-pm/data-model.md)
- **Research**: [specs/001-multi-tenant-pm/research.md](../specs/001-multi-tenant-pm/research.md)
- **API Contracts**: [specs/001-multi-tenant-pm/contracts/rest-api.md](../specs/001-multi-tenant-pm/contracts/rest-api.md)
- **Quick Start**: [specs/001-multi-tenant-pm/quickstart.md](../specs/001-multi-tenant-pm/quickstart.md)
- **Constitution**: [.specify/memory/constitution.md](./.specify/memory/constitution.md)

Tech Stack:

- **Frontend**: Next.js 18+, React, Tailwind CSS, DND Kit (Kanban drag-and-drop)
- **Backend**: Node.js/Express, TypeORM/Knex for ORM, JWT authentication, role-based middleware
- **Database**: PostgreSQL with tenant_id row-level isolation, optimistic locking via version column
- **Architecture**: Modular (controllers/services/repositories pattern), RESTful API, Docker deployment

Key Principles:

- Strict multi-tenant data isolation at API and DB layers
- Tenant ID scoping on all queries and mutations
- Optimistic locking for concurrent task updates
- Cursor-based pagination for scalability
- Comprehensive audit logging via task_history table
- Unit tests for services, integration tests for API endpoints
- Tailwind CSS design system for consistent UI

Feature Status: Phase 1 (Design/Contracts) Complete. Ready for Phase 2 (Tasks Generation).

<!-- SPECKIT END -->
