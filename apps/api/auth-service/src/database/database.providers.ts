import "dotenv/config";
import { DataSource } from "typeorm";
import path from "path";
import { User } from "../users/entities/user.entity";

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  migrations: [path.join(__dirname, "../migrations/*.{ts,js}")],
  synchronize: false,
  // logging: true,
});

export default appDataSource;
