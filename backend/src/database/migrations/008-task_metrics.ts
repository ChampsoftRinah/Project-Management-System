import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('task_metrics'))) {
    await knex.schema.createTable('task_metrics', (table) => {
      table.uuid('id').primary();
      table.uuid('tenant_id').notNullable();
      table.uuid('project_id').notNullable();
      table.date('metric_date').notNullable();
      table.string('status', 50).notNullable();
      table.integer('count').notNullable();
      table.decimal('avg_cycle_time_hours', 10, 2);
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.unique(['tenant_id', 'project_id', 'metric_date', 'status'], 'uq_metrics');
      table.foreign('tenant_id').references('tenants.id');
      table.foreign('project_id').references('projects.id');
      table.index(
        ['tenant_id', 'project_id', 'metric_date'],
        'idx_task_metrics_tenant_project_date'
      );
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('task_metrics');
}
