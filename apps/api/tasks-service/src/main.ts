import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL as string],
        queue: "tasks_queue",
        queueOptions: {
          durable: true,
          arguments: {
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": "tasks_dlq",
          },
        },
        noAck: true,
        prefetchCount: 10,
      },
      bufferLogs: true,
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}
bootstrap();
