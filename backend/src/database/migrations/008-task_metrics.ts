import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskMetricsMigration008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE task_metrics (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        project_id UUID NOT NULL,
        metric_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        count INT NOT NULL,
        avg_cycle_time_hours DECIMAL(10,2),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_metrics UNIQUE (tenant_id, project_id, metric_date, status),
        CONSTRAINT fk_task_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_metrics_project FOREIGN KEY (project_id) REFERENCES projects(id)
      );
      CREATE INDEX idx_task_metrics_tenant_project_date ON task_metrics(tenant_id, project_id, metric_date);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE task_metrics;`);
  }
}
