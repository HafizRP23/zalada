import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveTrashTable1770677565796 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE trash_users`)
        await queryRunner.query(`DROP TABLE trash_products`)

        await queryRunner.query(`
            ALTER TABLE users 
                ADD COLUMN deleted TINYINT(1) DEFAULT 0,
                ADD COLUMN deleted_at DATETIME DEFAULT NULL,
                ADD COLUMN deleted_reason VARCHAR(50) DEFAULT NULL
        `)

        await queryRunner.query(`
            ALTER TABLE products
                ADD COLUMN deleted TINYINT(1) DEFAULT 0,
                ADD COLUMN deleted_at DATETIME DEFAULT NULL,
                ADD COLUMN deleted_reason VARCHAR(50) DEFAULT NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Remove soft delete columns from products table
        await queryRunner.query(`
        ALTER TABLE products
            DROP COLUMN deleted,
            DROP COLUMN deleted_at,
            DROP COLUMN deleted_reason
    `);

        // 2. Remove soft delete columns from users table
        await queryRunner.query(`
        ALTER TABLE users
            DROP COLUMN deleted,
            DROP COLUMN deleted_at,
            DROP COLUMN deleted_reason
    `);

        // 3. Recreate trash_users table with final structure
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS trash_users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            phone_number VARCHAR(20),
            registered_date INT,
            address VARCHAR(255),
            user_level INT NOT NULL
        )
    `);

        // 4. Recreate trash_products table with final structure
        await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS trash_products (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(75) NOT NULL,
            description TEXT,
            price INT NOT NULL,
            store_id INT NOT NULL
        )
    `);
    }

}
