import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status ON tasks(tenant_id, status)');
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_tasks_tenant_project_status ON tasks(tenant_id, project_id, status)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users(tenant_id, is_active)'
  );
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email)');
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_tenants_active_created ON tenants(is_active, created_at)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_projects_tenant_active ON projects(tenant_id, is_active)'
  );
  await knex.raw(
    'CREATE INDEX IF NOT EXISTS idx_task_history_task_changed ON task_history(task_id, changed_at)'
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_tasks_tenant_status');
  await knex.raw('DROP INDEX IF EXISTS idx_tasks_tenant_project_status');
  await knex.raw('DROP INDEX IF EXISTS idx_users_tenant_active');
  await knex.raw('DROP INDEX IF EXISTS idx_users_tenant_email');
  await knex.raw('DROP INDEX IF EXISTS idx_tenants_active_created');
  await knex.raw('DROP INDEX IF EXISTS idx_projects_tenant_active');
  await knex.raw('DROP INDEX IF EXISTS idx_task_history_task_changed');
}
