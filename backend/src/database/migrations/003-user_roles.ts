import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('user_roles'))) {
    await knex.schema.createTable('user_roles', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('user_id').notNullable();
      table.string('role', 50).notNullable();
      table.timestamp('assigned_at').notNullable().defaultTo(knex.fn.now());
      table.uuid('assigned_by');
      table.unique(['tenant_id', 'user_id', 'role'], 'uq_tenant_user_role');
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('user_id').references('users.id');
      table.index(['tenant_id', 'role'], 'idx_user_roles_tenant_role');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_roles');
}
