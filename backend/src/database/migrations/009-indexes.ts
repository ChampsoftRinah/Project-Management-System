import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexesMigration009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status ON tasks(tenant_id, status);
      CREATE INDEX IF NOT EXISTS idx_tasks_tenant_project_status ON tasks(tenant_id, project_id, status);
      CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users(tenant_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_users_tenant_email ON users(tenant_id, email);
      CREATE INDEX IF NOT EXISTS idx_tenants_active_created ON tenants(is_active, created_at);
      CREATE INDEX IF NOT EXISTS idx_projects_tenant_active ON projects(tenant_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_task_history_task_changed ON task_history(task_id, changed_at);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tasks_tenant_status;
      DROP INDEX IF EXISTS idx_tasks_tenant_project_status;
      DROP INDEX IF EXISTS idx_users_tenant_active;
      DROP INDEX IF EXISTS idx_users_tenant_email;
      DROP INDEX IF EXISTS idx_tenants_active_created;
      DROP INDEX IF EXISTS idx_projects_tenant_active;
      DROP INDEX IF EXISTS idx_task_history_task_changed;
    `);
  }
}
