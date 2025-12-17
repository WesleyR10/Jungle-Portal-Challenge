import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import * as path from "path";
import { serverEnv } from "@jungle/env";

const CONFIG_FROM_ENV_ONLY = process.env.CONFIG_FROM_ENV_ONLY === "true";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: CONFIG_FROM_ENV_ONLY
        ? []
        : [
            path.resolve(process.cwd(), ".env"),
            path.resolve(process.cwd(), "../../../.env"),
          ],
      validate: () => serverEnv,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
