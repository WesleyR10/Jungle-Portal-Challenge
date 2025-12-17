import "dotenv/config";
import { DataSource } from "typeorm";
import { Notification } from "../notifications/entities/notification.entity";

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Notification],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  // logging: true,
});

export default appDataSource;
