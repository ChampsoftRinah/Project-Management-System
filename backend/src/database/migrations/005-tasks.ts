import type { Knex } from 'knex';

const taskStatusValues = [
  'Open',
  'Ready for Development',
  'In Development',
  'Development Completed',
  'Ready for QA',
  'In QA',
  'QA Passed',
  'QA Failed',
] as const;

const taskPriorityValues = ['Low', 'Medium', 'High', 'Critical'] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
        CREATE TYPE task_status AS ENUM (${taskStatusValues.map((v) => `'${v}'`).join(', ')});
      END IF;
    END
    $$;
  `);

  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
        CREATE TYPE task_priority AS ENUM (${taskPriorityValues.map((v) => `'${v}'`).join(', ')});
      END IF;
    END
    $$;
  `);

  if (!(await knex.schema.hasTable('tasks'))) {
    await knex.schema.createTable('tasks', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('project_id').notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.specificType('status', 'task_status').notNullable().defaultTo('Open');
      table.specificType('priority', 'task_priority').defaultTo('Medium');
      table.uuid('assignee_id');
      table.uuid('reporter_id').notNullable();
      table.specificType('labels', 'text[]');
      table.integer('version').notNullable().defaultTo(1);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('project_id').references('projects.id');
      table.foreign('assignee_id').references('users.id');
      table.foreign('reporter_id').references('users.id');
      table.index(['tenant_id', 'status'], 'idx_tasks_tenant_status');
      table.index(['tenant_id', 'project_id', 'status'], 'idx_tasks_tenant_project_status');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.raw('DROP TYPE IF EXISTS task_status CASCADE');
  await knex.schema.raw('DROP TYPE IF EXISTS task_priority CASCADE');
}
