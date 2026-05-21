import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('projects', 'is_deleted'))) {
    await knex.schema.alterTable('projects', (table) => {
      table.boolean('is_deleted').notNullable().defaultTo(false);
    });
  }

  if (!(await knex.schema.hasColumn('tasks', 'is_deleted'))) {
    await knex.schema.alterTable('tasks', (table) => {
      table.boolean('is_deleted').notNullable().defaultTo(false);
    });
  }

  await knex.raw('CREATE INDEX IF NOT EXISTS idx_projects_is_deleted ON projects(is_deleted)');
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE projects DROP COLUMN IF EXISTS is_deleted');
  await knex.raw('ALTER TABLE tasks DROP COLUMN IF EXISTS is_deleted');
}
