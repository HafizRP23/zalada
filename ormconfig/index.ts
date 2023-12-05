import "reflect-metadata"
import "dotenv/config"
import { DataSource } from "typeorm";

export default new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    migrations: ["dist/ormconfig/migrations/*.js"],
})