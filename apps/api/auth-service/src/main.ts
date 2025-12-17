import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: "auth_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.startAllMicroservices();
  await app.listen(process.env.AUTH_SERVICE_PORT ?? 3001);
  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
bootstrap();
