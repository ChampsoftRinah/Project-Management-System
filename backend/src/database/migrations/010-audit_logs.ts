import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('audit_logs'))) {
    await knex.schema.createTable('audit_logs', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('actor_id').notNullable();
      table.string('action', 100).notNullable();
      table.string('entity_type', 50).notNullable();
      table.uuid('entity_id').notNullable();
      table.jsonb('changes');
      table.string('ip_address', 45);
      table.string('user_agent', 500);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('actor_id').references('users.id');
      table.index(['tenant_id', 'created_at'], 'idx_audit_logs_tenant_created');
      table.index(['actor_id', 'created_at'], 'idx_audit_logs_actor_created');
      table.index(['entity_type', 'entity_id'], 'idx_audit_logs_entity');
      table.index('action', 'idx_audit_logs_action');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
}
