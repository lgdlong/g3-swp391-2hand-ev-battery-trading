import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationFieldsToPost implements MigrationInterface {
  name = 'AddVerificationFieldsToPost';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD COLUMN "verification_requested_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "posts"
      ADD COLUMN "verification_rejected_at" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "posts"
      DROP COLUMN "verification_rejected_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "posts"
      DROP COLUMN "verification_requested_at"
    `);
  }
}
