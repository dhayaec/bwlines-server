import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminUser1535369159655 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'DROP INDEX `IDX_46dfd017ccfc2288a23081d275` ON `users`',
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `isAdmin` tinyint NOT NULL DEFAULT 0',
    );
    await queryRunner.query(
      'CREATE INDEX `IDX_3128c66187815919afc18880a7` ON `users`(`isBanned`, `username`, `confirmed`, `isAdmin`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'DROP INDEX `IDX_3128c66187815919afc18880a7` ON `users`',
    );
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `isAdmin`');
    await queryRunner.query(
      'CREATE INDEX `IDX_46dfd017ccfc2288a23081d275` ON `users`(`isBanned`, `username`, `confirmed`)',
    );
  }
}
