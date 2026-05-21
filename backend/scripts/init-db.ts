import 'dotenv/config';
import { Pool } from 'pg';

// Connect to default postgres db first to create pm_system if needed
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rinah',
  database: 'postgres', // Connect to default db
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rinah',
  database: process.env.DB_NAME || 'pm_system',
});

async function initializeDatabase() {
  let adminClient: any;
  let client: any;

  try {
    console.log('📦 Initializing database...\n');

    // Step 1: Create database if it doesn't exist
    console.log('Step 1: Ensuring pm_system database exists...');
    adminClient = await adminPool.connect();
    try {
      await adminClient.query(`CREATE DATABASE pm_system;`);
      console.log('  ✓ Created pm_system database\n');
    } catch (err: any) {
      if (err.code === '42P04') {
        // Database already exists
        console.log('  ✓ Database pm_system already exists\n');
      } else {
        throw err;
      }
    }
    adminClient.release();

    // Step 2: Connect to pm_system and create schema
    console.log('Step 2: Creating schema...');
    client = await pool.connect();

    // 1. Tenants table
    console.log('Creating tenants table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB
      );
      CREATE INDEX IF NOT EXISTS idx_tenants_active_created ON tenants(is_active, created_at);
    `);

    // 2. Users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_tenant_email UNIQUE (tenant_id, email),
        CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
      CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users(tenant_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
    `);

    // 3. User roles table
    console.log('Creating user_roles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(50) NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        assigned_by UUID,
        CONSTRAINT uq_tenant_user_role UNIQUE (tenant_id, user_id, role),
        CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_role ON user_roles(tenant_id, role);
    `);

    // 4. Projects table
    console.log('Creating projects table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT fk_projects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_projects_tenant_active ON projects(tenant_id, is_active);
    `);

    // 5. Task enums and tasks table
    console.log('Creating task enums and tasks table...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE task_status AS ENUM (
          'Open', 'Ready for Development', 'In Development', 
          'Development Completed', 'Ready for QA', 'In QA', 
          'QA Passed', 'QA Failed'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        project_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'Open',
        priority task_priority DEFAULT 'Medium',
        assignee_id UUID,
        reporter_id UUID NOT NULL,
        labels TEXT[],
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id),
        CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
        CONSTRAINT fk_tasks_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status ON tasks(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_tasks_tenant_project_status ON tasks(tenant_id, project_id, status);
    `);

    // 6. Task history table
    console.log('Creating task_history table...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE task_action AS ENUM ('created', 'status_changed', 'assigned', 'reassigned', 'deleted');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      CREATE TABLE IF NOT EXISTS task_history (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        task_id UUID NOT NULL,
        changed_by UUID NOT NULL,
        action task_action NOT NULL,
        old_value JSONB,
        new_value JSONB,
        changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_task_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_history_task FOREIGN KEY (task_id) REFERENCES tasks(id),
        CONSTRAINT fk_task_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_task_history_tenant_task_changed ON task_history(tenant_id, task_id, changed_at);
    `);

    // 7. Task comments table (from migrations/007)
    console.log('Creating task_comments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        task_id UUID NOT NULL,
        author_id UUID NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT fk_task_comments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id),
        CONSTRAINT fk_task_comments_author FOREIGN KEY (author_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_task_comments_task_created ON task_comments(task_id, created_at);
    `);

    // 8. Task metrics table (from migrations/008)
    console.log('Creating task_metrics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_metrics (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        project_id UUID NOT NULL,
        metric_date DATE NOT NULL,
        status task_status NOT NULL,
        count INT NOT NULL DEFAULT 0,
        avg_cycle_time_hours DECIMAL(10, 2),
        CONSTRAINT uq_metric_date_status UNIQUE (tenant_id, project_id, metric_date, status),
        CONSTRAINT fk_task_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_metrics_project FOREIGN KEY (project_id) REFERENCES projects(id)
      );
      CREATE INDEX IF NOT EXISTS idx_task_metrics_tenant_date ON task_metrics(tenant_id, metric_date);
    `);

    // 9. Audit logs table (from migrations/010)
    console.log('Creating audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        actor_id UUID NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    `);

    console.log('\n✅ Database schema initialized successfully!\n');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (client) client.release();
    if (adminClient) adminClient.release();
    await pool.end();
    await adminPool.end();
  }
}

initializeDatabase();
