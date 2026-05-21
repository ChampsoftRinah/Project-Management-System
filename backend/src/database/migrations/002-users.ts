import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.string('email', 255).notNullable();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100);
      table.string('last_name', 100);
      table.boolean('is_active').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.unique(['tenant_id', 'email'], 'uq_tenant_email');
      table.foreign('tenant_id').references('tenants.id');
      table.index(['tenant_id', 'is_active'], 'idx_users_tenant_active');
      table.index(['tenant_id', 'email'], 'idx_users_tenant_email');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
