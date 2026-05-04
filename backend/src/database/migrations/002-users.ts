import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersMigration002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_tenant_email UNIQUE (tenant_id, email),
        CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      );
      CREATE INDEX idx_users_tenant_active ON users(tenant_id, is_active);
      CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
  }
}
