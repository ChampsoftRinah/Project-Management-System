import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskCommentsMigration007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE task_comments (
        id UUID PRIMARY KEY,
        tenant_id UUID NOT NULL,
        task_id UUID NOT NULL,
        author_id UUID NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT false,
        CONSTRAINT fk_task_comments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id),
        CONSTRAINT fk_task_comments_author FOREIGN KEY (author_id) REFERENCES users(id)
      );
      CREATE INDEX idx_task_comments_tenant_task_created ON task_comments(tenant_id, task_id, created_at);
    `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE task_comments;`);
  }
}
