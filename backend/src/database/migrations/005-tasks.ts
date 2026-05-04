import { MigrationInterface, QueryRunner } from 'typeorm';

export class TasksMigration005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE task_status AS ENUM ('Open', 'Ready for Development', 'In Development', 'Development Completed', 'Ready for QA', 'In QA', 'QA Passed', 'QA Failed');
      CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
      CREATE TABLE tasks (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        project_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'Open',
        priority task_priority DEFAULT 'Medium',
        assignee_id UUID,
        reporter_id UUID NOT NULL,
        labels TEXT[],
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_tasks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id),
        CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
        CONSTRAINT fk_tasks_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)
      );
      CREATE INDEX idx_tasks_tenant_status ON tasks(tenant_id, status);
      CREATE INDEX idx_tasks_tenant_project_status ON tasks(tenant_id, project_id, status);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tasks; DROP TYPE task_status; DROP TYPE task_priority;`);
  }
}
