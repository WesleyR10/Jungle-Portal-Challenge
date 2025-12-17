import { Module } from "@nestjs/common";
import { ConfigModule } from "@jungle/config-module";
import { LoggerModule } from "nestjs-pino";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { User } from "./users/entities/user.entity";
import { UsersModule } from "./users/users.module";

import { AppController } from "./app.controller";

import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty" }
            : undefined,
        autoLogging: false,
      },
    }),
    HealthModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USER"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"),
        entities: [User],
        synchronize: false,
        autoLoadEntities: true,
        // logging: true,
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
