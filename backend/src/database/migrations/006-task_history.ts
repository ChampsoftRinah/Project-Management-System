import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskHistoryMigration006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE task_action AS ENUM ('created', 'status_changed', 'assigned', 'reassigned', 'deleted');
      CREATE TABLE task_history (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        task_id UUID NOT NULL,
        changed_by UUID NOT NULL,
        action task_action NOT NULL,
        old_value JSONB,
        new_value JSONB,
        changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_task_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_history_task FOREIGN KEY (task_id) REFERENCES tasks(id),
        CONSTRAINT fk_task_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
      );
      CREATE INDEX idx_task_history_tenant_task_changed ON task_history(tenant_id, task_id, changed_at);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE task_history; DROP TYPE task_action;`);
  }
}
