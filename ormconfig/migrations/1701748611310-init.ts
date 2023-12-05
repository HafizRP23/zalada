import { MigrationInterface, QueryRunner } from "typeorm"

export class Init1701748611310 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        //create carts table
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS carts (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT NOT NULL,
                quantity INT,
                customer_id INT NOT NULL,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (customer_id) REFERENCES users(id)
            );`
        )

        // Create banks table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS banks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            bank_name VARCHAR(255) UNIQUE,
            account VARCHAR(20) NOT NULL
            );`
        )

        const values = [
            ["BCA", "2210089856"],
            ["BRI", "1234567890"],
            ["BNI", "7876766738"],
            ["Mandiri", "9876543210"]  
        ];
          
        
        await queryRunner.query("INSERT INTO banks (bank_name, account) VALUES ?", [values]);
        
          
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE carts`)
        await queryRunner.query(`DROP TABLE banks`)
    }
}
