import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectsMigration004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE projects (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_by UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT fk_projects_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_projects_creator FOREIGN KEY (created_by) REFERENCES users(id)
      );
      CREATE INDEX idx_projects_tenant_active ON projects(tenant_id, is_active);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE projects;`);
  }
}
