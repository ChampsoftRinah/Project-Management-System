import { MigrationInterface, QueryRunner } from 'typeorm';

export class TenantsMigration001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tenants (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB
      );
      CREATE INDEX idx_tenants_active_created ON tenants(is_active, created_at);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tenants;`);
  }
}
