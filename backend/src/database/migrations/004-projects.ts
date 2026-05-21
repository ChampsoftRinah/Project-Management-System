import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('projects'))) {
    await knex.schema.createTable('projects', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.uuid('created_by');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_active').notNullable().defaultTo(true);
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('created_by').references('users.id');
      table.index(['tenant_id', 'is_active'], 'idx_projects_tenant_active');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('projects');
}
