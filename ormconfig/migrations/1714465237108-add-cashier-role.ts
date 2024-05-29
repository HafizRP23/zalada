import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCashierRole1714465237108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new role cashier
        await queryRunner.query(`INSERT INTO user_roles (name) VALUES (?)`, ['cashier'])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
