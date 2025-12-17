import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from "@jungle/types";
import {
  COMMENTS_REPOSITORY,
  ICommentsRepository,
  ITaskHistoryRepository,
  ITasksRepository,
  TASKS_REPOSITORY,
  TASK_HISTORY_REPOSITORY,
} from "./tasks.repository";

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY)
    private tasksRepository: ITasksRepository,
    @Inject(COMMENTS_REPOSITORY)
    private commentsRepository: ICommentsRepository,
    @Inject(TASK_HISTORY_REPOSITORY)
    private taskHistoryRepository: ITaskHistoryRepository,
    @Inject("TASKS_EVENTS") private client: ClientProxy,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { dueDate, ...rest } = createTaskDto;
    const task = this.tasksRepository.create({
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    const savedTask = await this.tasksRepository.save(task);
    await this.taskHistoryRepository.save(
      this.taskHistoryRepository.create({
        taskId: savedTask.id,
        action: "CREATED",
        changes: null,
        performedBy: rest.assigneeIds?.[0] || "",
      }),
    );
    this.client.emit("task.created", savedTask);
    return savedTask;
  }

  async findAll(page: number, size: number) {
    const [data, total] = await this.tasksRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { created_at: "DESC" },
      relations: [],
    });
    return { data, total, page, size };
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ["comments"],
    });
    if (!task) {
      throw new RpcException(new NotFoundException(`Task #${id} not found`));
    }
    if (task.comments?.length) {
      task.comments = task.comments.map((c) => ({
        id: c.id,
        content: c.content,
        authorId: c.authorId,
        taskId: c.taskId,
        created_at: c.created_at,
      })) as any;
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    const { dueDate, ...rest } = updateTaskDto;
    const previous = { ...task };
    this.tasksRepository.merge(task, {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : task.dueDate,
    });
    const updatedTask = await this.tasksRepository.save(task);

    const changes: Record<string, { old: unknown; new: unknown }> = {};
    for (const key of Object.keys(rest) as (keyof UpdateTaskDto)[]) {
      if (previous[key] !== updatedTask[key]) {
        changes[key as string] = { old: previous[key], new: updatedTask[key] };
      }
    }

    await this.taskHistoryRepository.save(
      this.taskHistoryRepository.create({
        taskId: updatedTask.id,
        action: "UPDATED",
        changes: Object.keys(changes).length ? changes : null,
        performedBy: rest.assigneeIds?.[0] || "",
      }),
    );

    this.client.emit("task.updated", updatedTask);
    return updatedTask;
  }

  async remove(id: string) {
    const task = await this.findOne(id);
    await this.tasksRepository.remove(task);
    return { id };
  }

  async addComment(
    taskId: string,
    createCommentDto: CreateCommentDto & { authorId: string },
  ) {
    const task = await this.findOne(taskId);
    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      authorId: createCommentDto.authorId,
      task,
      taskId: task.id,
    });
    const savedComment = await this.commentsRepository.save(comment);

    await this.taskHistoryRepository.save(
      this.taskHistoryRepository.create({
        taskId: task.id,
        action: "COMMENT_ADDED",
        changes: {
          commentId: { old: null, new: savedComment.id },
        },
        performedBy: createCommentDto.authorId,
      }),
    );

    this.client.emit("task.comment.created", {
      ...savedComment,
      taskTitle: task.title,
      taskAssigneeIds: task.assigneeIds,
    });
    return savedComment;
  }

  async getHistory(taskId: string) {
    await this.findOne(taskId);
    return this.taskHistoryRepository.find({
      where: { taskId },
      order: { created_at: "DESC" },
    });
  }

  async findComments(taskId: string, page: number, size: number) {
    const [data, total] = await this.commentsRepository.findAndCount({
      where: { taskId },
      skip: (page - 1) * size,
      take: size,
      order: { created_at: "DESC" },
    });

    return { data, total, page, size };
  }
}
