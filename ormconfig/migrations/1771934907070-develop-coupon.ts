import { MigrationInterface, QueryRunner } from "typeorm";

export class DevelopCoupon1771934907070 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) NOT NULL UNIQUE,
                discount_type ENUM('percentage', 'fixed') NOT NULL,
                discount_value INT NOT NULL,
                quota_total INT NOT NULL,
                start_at DATETIME,
                expired_at DATETIME,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `)

        await queryRunner.query(`
            CREATE TABLE coupons_usages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                coupon_id INT NOT NULL,
                user_id INT NOT NULL,
                order_id INT,
                order_no VARCHAR(255) NOT NULL,
                amount_cut INT NOT NULL
            )
        `)

        await queryRunner.query(`
            ALTER TABLE orders 
                ADD COLUMN price_after_discount INT NOT NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS coupons_usages`);
        await queryRunner.query(`DROP TABLE IF EXISTS coupons`)
    }

}
