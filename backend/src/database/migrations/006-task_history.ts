import type { Knex } from 'knex';

const taskActionValues = [
  'created',
  'status_changed',
  'assigned',
  'reassigned',
  'deleted',
] as const;

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_action') THEN
        CREATE TYPE task_action AS ENUM (${taskActionValues.map((v) => `'${v}'`).join(', ')});
      END IF;
    END
    $$;
  `);

  if (!(await knex.schema.hasTable('task_history'))) {
    await knex.schema.createTable('task_history', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('task_id').notNullable();
      table.uuid('changed_by').notNullable();
      table.specificType('action', 'task_action').notNullable();
      table.jsonb('old_value');
      table.jsonb('new_value');
      table.timestamp('changed_at').notNullable().defaultTo(knex.fn.now());
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('task_id').references('tasks.id');
      table.foreign('changed_by').references('users.id');
      table.index(['tenant_id', 'task_id', 'changed_at'], 'idx_task_history_tenant_task_changed');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_history');
  await knex.schema.raw('DROP TYPE IF EXISTS task_action CASCADE');
}
