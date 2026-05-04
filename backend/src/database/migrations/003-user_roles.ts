import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserRolesMigration003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_roles (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        user_id UUID NOT NULL,
        role VARCHAR(50) NOT NULL,
        assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        assigned_by UUID,
        CONSTRAINT uq_tenant_user_role UNIQUE (tenant_id, user_id, role),
        CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id)
      );
      CREATE INDEX idx_user_roles_tenant_role ON user_roles(tenant_id, role);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_roles;`);
  }
}
