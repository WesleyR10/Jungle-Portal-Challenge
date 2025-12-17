import path from "path";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Task } from "../src/tasks/entities/task.entity";
import { Comment } from "../src/tasks/entities/comment.entity";
import { TaskHistory } from "../src/tasks/entities/task-history.entity";
import { TaskPriority, TaskStatus } from "@jungle/types";

const rootEnvPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: rootEnvPath });
dotenv.config();

async function clearDatabase(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.query(
      'TRUNCATE TABLE "comment", "task_history", "task" RESTART IDENTITY CASCADE',
    );
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

type SeedContext = {
  userIds: string[];
};

async function seedTasks(ctx: SeedContext, dataSource: DataSource) {
  const taskRepo = dataSource.getRepository(Task);
  const commentRepo = dataSource.getRepository(Comment);
  const historyRepo = dataSource.getRepository(TaskHistory);

  const [user1, user2, user3, user4] = ctx.userIds;

  const baseTasks: Partial<Task>[] = [
    {
      title: "Configurar autenticação JWT no Gateway",
      description:
        "Implementar guards, estratégias e refresh token no API Gateway.",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assigneeIds: [user1, user2],
    },
    {
      title: "Criar página de listagem de tarefas",
      description:
        "Listar tasks paginadas, com filtros por status e prioridade.",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      assigneeIds: [user2],
    },
    {
      title: "Integrar WebSocket para notificações em tempo real",
      description:
        "Conectar front ao notifications-service e exibir toasts na UI.",
      priority: TaskPriority.URGENT,
      status: TaskStatus.IN_PROGRESS,
      assigneeIds: [user3],
    },
    {
      title: "Implementar histórico de alterações de tarefas",
      description:
        "Registrar mudanças de status, prioridade e atribuições no banco.",
      priority: TaskPriority.HIGH,
      status: TaskStatus.REVIEW,
      assigneeIds: [user1, user3],
    },
    {
      title: "Ajustar estilos da lista com shadcn/ui",
      description: "Aplicar componentes e tokens de design do sistema.",
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      assigneeIds: [user4],
    },
    {
      title: "Configurar docker-compose para ambiente de desenvolvimento",
      description: "Garantir que todos serviços sobem com um único comando.",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.DONE,
      assigneeIds: [user1],
    },
    {
      title: "Criar testes e2e básicos para fluxo de tasks",
      description:
        "Cobrir criação, edição, comentários e deleção de tarefas via Gateway.",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      assigneeIds: [user2, user4],
    },
    {
      title: "Refinar validações de DTOs com class-validator",
      description: "Garantir mensagens claras e payloads bem tipados.",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      assigneeIds: [user3],
    },
  ];

  const tasks: Task[] = [];

  for (const base of baseTasks) {
    const task = taskRepo.create({
      ...base,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const saved = await taskRepo.save(task);
    tasks.push(saved);

    const history = historyRepo.create({
      taskId: saved.id,
      action: "CREATED",
      changes: null,
      performedBy: base.assigneeIds?.[0] ?? "",
    });
    await historyRepo.save(history);
  }

  const commentsSeed: Array<{ task: Task; authorId: string; content: string }> =
    [
      {
        task: tasks[0],
        authorId: user2,
        content: "Vou cuidar da parte de refresh token.",
      },
      {
        task: tasks[2],
        authorId: user3,
        content: "WebSocket conectado, falta só tratar reconexão.",
      },
      {
        task: tasks[3],
        authorId: user1,
        content: "Histórico básico pronto, validando payloads.",
      },
      {
        task: tasks[5],
        authorId: user1,
        content: "Compose ajustado, subindo tudo com um comando.",
      },
    ];

  for (const c of commentsSeed) {
    const comment = commentRepo.create({
      taskId: c.task.id,
      authorId: c.authorId,
      content: c.content,
    });
    await commentRepo.save(comment);

    const history = historyRepo.create({
      taskId: c.task.id,
      action: "COMMENT_ADDED",
      changes: null,
      performedBy: c.authorId,
    });
    await historyRepo.save(history);
  }

  return tasks;
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
    entities: [Task, Comment, TaskHistory],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await clearDatabase(dataSource);

    const rawUserIds = process.env.SEED_USER_IDS;
    if (!rawUserIds) {
      throw new Error(
        "Missing env SEED_USER_IDS with comma-separated user IDs from auth-service seed",
      );
    }

    const userIds = rawUserIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (userIds.length < 4) {
      throw new Error("SEED_USER_IDS must contain at least 4 user IDs");
    }

    const tasks = await seedTasks({ userIds }, dataSource);
    console.log(
      "Seeded tasks:",
      tasks.map((t) => ({ id: t.id, title: t.title })),
    );
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
