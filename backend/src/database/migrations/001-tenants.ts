import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('tenants'))) {
    await knex.schema.createTable('tenants', (table) => {
      table.uuid('id').primary();
      table.string('name', 255).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.boolean('is_active').notNullable().defaultTo(true);
      table.jsonb('metadata');
      table.index(['is_active', 'created_at'], 'idx_tenants_active_created');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tenants');
}
