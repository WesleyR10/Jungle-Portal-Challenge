import path from "path";
import dotenv from "dotenv";

const rootEnvPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

import appDataSource from "../src/database/database.providers";

async function main() {
  await appDataSource.initialize();
  const migrations = await appDataSource.showMigrations();
  console.log("Migrations:", migrations);
  await appDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
