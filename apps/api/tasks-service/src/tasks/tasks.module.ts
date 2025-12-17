import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { Task } from "./entities/task.entity";
import { Comment } from "./entities/comment.entity";
import { TaskHistory } from "./entities/task-history.entity";
import {
  COMMENTS_REPOSITORY,
  CommentsRepository,
  TASKS_REPOSITORY,
  TASK_HISTORY_REPOSITORY,
  TasksRepository,
  TaskHistoryRepository,
} from "./tasks.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment, TaskHistory]),
    ClientsModule.register([
      {
        name: "TASKS_EVENTS",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672",
          ],
          queue: "jungle_tasks_events", // Nome da fila que será criada/usada
          queueOptions: {
            durable: true, // Fila durável para não perder mensagens se o broker cair
            arguments: {
              "x-dead-letter-exchange": "",
              "x-dead-letter-routing-key": "jungle_notifications_dlq",
            },
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TasksRepository,
    CommentsRepository,
    TaskHistoryRepository,
    {
      provide: TASKS_REPOSITORY,
      useExisting: TasksRepository,
    },
    {
      provide: COMMENTS_REPOSITORY,
      useExisting: CommentsRepository,
    },
    {
      provide: TASK_HISTORY_REPOSITORY,
      useExisting: TaskHistoryRepository,
    },
  ],
})
export class TasksModule {}
