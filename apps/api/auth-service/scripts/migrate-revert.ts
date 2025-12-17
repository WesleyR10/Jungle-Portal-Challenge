import path from "path";
import dotenv from "dotenv";

// Carrega .env da raiz se existir, antes de qualquer coisa
const rootEnvPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: rootEnvPath });

// Carrega .env local se existir (opcional, sobrescreve)
dotenv.config();

import appDataSource from "../src/database/database.providers";

async function main() {
  const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing env ${key}`);
    }
  }
  await appDataSource.initialize();
  await appDataSource.undoLastMigration();
  console.log(`Reverted last migration`);
  await appDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
