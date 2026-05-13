import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogsMigration010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE audit_action AS ENUM (
        'create', 'read', 'update', 'delete',
        'role_assigned', 'role_removed', 'login', 'logout',
        'export', 'import', 'status_changed'
      );

      CREATE TABLE audit_logs (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        action audit_action NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id UUID NOT NULL,
        changes JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_audit_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
      CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
      CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX idx_audit_logs_action ON audit_logs(action);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE audit_logs;
      DROP TYPE audit_action;
    `);
  }
}
