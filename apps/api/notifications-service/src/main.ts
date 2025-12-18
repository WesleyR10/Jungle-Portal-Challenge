import { Logger } from "nestjs-pino";
import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);

  const port = Number(process.env.NOTIFICATIONS_PORT || 3004);

  await app.listen(port);

  const microservice = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: "jungle_tasks_events", // Nome da fila que o tasks-service envia
      queueOptions: {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "jungle_notifications_dlq",
        },
      },
      noAck: true,
      prefetchCount: 10,
    },
  });

  microservice.useLogger(logger);
  await app.startAllMicroservices();
}

bootstrap();
