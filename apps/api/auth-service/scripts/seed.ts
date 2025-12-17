import path from "path";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { UsersService } from "../src/users/users.service";
import { UsersRepository } from "../src/users/users.repository";
import { User } from "../src/users/entities/user.entity";

const rootEnvPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

async function clearDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function seedUsers(dataSource: DataSource) {
  const usersRepository = new UsersRepository(dataSource.getRepository(User));
  const usersService = new UsersService(usersRepository);

  const baseUsers = [
    {
      email: "alice@example.com",
      username: "alice",
      password: "Password123!",
    },
    {
      email: "bob@example.com",
      username: "bob",
      password: "Password123!",
    },
    {
      email: "charlie@example.com",
      username: "charlie",
      password: "Password123!",
    },
    {
      email: "diana@example.com",
      username: "diana",
      password: "Password123!",
    },
  ];

  const createdUsers = [];

  for (const user of baseUsers) {
    const created = await usersService.create(user as any);
    createdUsers.push(created);
  }

  return createdUsers;
}

async function main() {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env ${key}`);
    }
  }

  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER as string,
    password: String(process.env.DB_PASSWORD ?? ""),
    database: process.env.DB_NAME as string,
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await clearDatabase(dataSource);
    const users = await seedUsers(dataSource);
    console.log(
      "Seeded users:",
      users.map((u) => ({ id: u.id, email: u.email })),
    );
    // Print IDs in a deterministic order for tasks-service seed
    const ordered = users.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const ids = ordered.map((u) => u.id).join(",");
    console.log("SEED_USER_IDS:", ids);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
