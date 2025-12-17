import { Module } from "@nestjs/common";
import { ConfigModule } from "@jungle/config-module";
import { LoggerModule } from "nestjs-pino";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { TasksModule } from "./tasks/tasks.module";
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST"),
        port: config.get<number>("DB_PORT"),
        username: config.get<string>("DB_USER"),
        password: config.get<string>("DB_PASSWORD"),
        database: config.get<string>("DB_NAME"), // Should be DB_NAME_TASKS ideally, or share DB? Assuming separate DB or same.
        // For simplicity, let's use the same DB env var but we should verify if they use different DBs.
        // Usually microservices have their own DBs. Let's assume DB_NAME is configured per service env.
        autoLoadEntities: true,
        synchronize: false,
        logging: true,
      }),
    }),
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
