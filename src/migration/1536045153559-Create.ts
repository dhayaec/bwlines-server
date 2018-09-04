import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create1536045153559 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'CREATE TABLE `categories` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `isBanned` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `nsleft` int NOT NULL DEFAULT 1, `nsright` int NOT NULL DEFAULT 2, `parentId` int NULL, INDEX `IDX_57660c5d8ad7423a9ee8cee923` (`parentId`, `isBanned`), UNIQUE INDEX `IDX_420d9f679d41281f282f5bc7d0` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'CREATE TABLE `books` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `coverImage` varchar(255) NULL, `description` text NULL, `isbn` varchar(13) NOT NULL, `rating` double NOT NULL DEFAULT 0, `offerPrice` double NOT NULL DEFAULT 0, `price` double NOT NULL DEFAULT 0, `yourSavings` double NOT NULL DEFAULT 0, `publishedYear` double NOT NULL DEFAULT 0, `isBanned` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `categoryId` int NULL, INDEX `IDX_f4d9ce97adc6bbce5e3aabae1c` (`isBanned`, `publishedYear`), UNIQUE INDEX `IDX_e03f6d84c16e96f5f095ecd331` (`slug`, `isbn`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'CREATE TABLE `users` (`id` varchar(255) NOT NULL, `name` varchar(100) NOT NULL, `email` varchar(255) NOT NULL, `username` varchar(30) NULL, `mobile` varchar(20) NULL, `password` text NOT NULL, `confirmed` tinyint NOT NULL DEFAULT 0, `isBanned` tinyint NOT NULL DEFAULT 0, `lastResetRequestTime` datetime NULL, `profilePic` varchar(255) NULL, `isAdmin` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, INDEX `IDX_3128c66187815919afc18880a7` (`isBanned`, `username`, `confirmed`, `isAdmin`), UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'CREATE TABLE `cart` (`id` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `quantity` int NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `version` int NOT NULL, `bookId` varchar(255) NULL, `userId` varchar(255) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'ALTER TABLE `categories` ADD CONSTRAINT `FK_9a6f051e66982b5f0318981bcaa` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`)',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'ALTER TABLE `books` ADD CONSTRAINT `FK_a0f13454de3df36e337e01dbd55` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`)',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'ALTER TABLE `cart` ADD CONSTRAINT `FK_15605eba0be4c6669389090dd15` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`)',
    );

    await queryRunner.query(
      // tslint:disable-next-line:max-line-length
      'ALTER TABLE `cart` ADD CONSTRAINT `FK_756f53ab9466eb52a52619ee019` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE `cart` DROP FOREIGN KEY `FK_756f53ab9466eb52a52619ee019`',
    );
    await queryRunner.query(
      'ALTER TABLE `cart` DROP FOREIGN KEY `FK_15605eba0be4c6669389090dd15`',
    );
    await queryRunner.query(
      'ALTER TABLE `books` DROP FOREIGN KEY `FK_a0f13454de3df36e337e01dbd55`',
    );
    await queryRunner.query(
      'ALTER TABLE `categories` DROP FOREIGN KEY `FK_9a6f051e66982b5f0318981bcaa`',
    );
    await queryRunner.query('DROP TABLE `cart`');
    await queryRunner.query(
      'DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_3128c66187815919afc18880a7` ON `users`',
    );
    await queryRunner.query('DROP TABLE `users`');
    await queryRunner.query(
      'DROP INDEX `IDX_e03f6d84c16e96f5f095ecd331` ON `books`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_f4d9ce97adc6bbce5e3aabae1c` ON `books`',
    );
    await queryRunner.query('DROP TABLE `books`');
    await queryRunner.query(
      'DROP INDEX `IDX_420d9f679d41281f282f5bc7d0` ON `categories`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_57660c5d8ad7423a9ee8cee923` ON `categories`',
    );
    await queryRunner.query('DROP TABLE `categories`');
  }
}
