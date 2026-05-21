import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('task_comments'))) {
    await knex.schema.createTable('task_comments', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('task_id').notNullable();
      table.uuid('author_id').notNullable();
      table.text('body').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_deleted').notNullable().defaultTo(false);
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('task_id').references('tasks.id');
      table.foreign('author_id').references('users.id');
      table.index(['tenant_id', 'task_id', 'created_at'], 'idx_task_comments_tenant_task_created');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_comments');
}
