import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { Comment } from "./entities/comment.entity";
import { TaskHistory } from "./entities/task-history.entity";

export interface ITasksRepository {
  create(data: Partial<Task>): Task;
  save(task: Task): Promise<Task>;
  merge(target: Task, source: Partial<Task>): Task;
  findAndCount(options: {
    skip: number;
    take: number;
    order: { created_at: "DESC" };
    relations: string[];
  }): Promise<[Task[], number]>;
  findOne(options: {
    where: { id: string };
    relations: string[];
  }): Promise<Task | null>;
  remove(task: Task): Promise<Task>;
}

export interface ICommentsRepository {
  create(data: Partial<Comment>): Comment;
  save(comment: Comment): Promise<Comment>;
  findAndCount(options: {
    where: { taskId: string };
    skip: number;
    take: number;
    order: { created_at: "DESC" };
  }): Promise<[Comment[], number]>;
}

export const TASKS_REPOSITORY = Symbol("TASKS_REPOSITORY");
export const COMMENTS_REPOSITORY = Symbol("COMMENTS_REPOSITORY");
export const TASK_HISTORY_REPOSITORY = Symbol("TASK_HISTORY_REPOSITORY");

export interface ITaskHistoryRepository {
  create(data: Partial<TaskHistory>): TaskHistory;
  save(history: TaskHistory): Promise<TaskHistory>;
  find(options: {
    where: { taskId: string };
    order: { created_at: "DESC" };
  }): Promise<TaskHistory[]>;
}

@Injectable()
export class TasksRepository implements ITasksRepository {
  constructor(
    @InjectRepository(Task)
    private repo: Repository<Task>,
  ) {}

  create(data: Partial<Task>): Task {
    return this.repo.create(data);
  }

  save(task: Task): Promise<Task> {
    return this.repo.save(task);
  }

  merge(target: Task, source: Partial<Task>): Task {
    return this.repo.merge(target, source);
  }

  findAndCount(options: {
    skip: number;
    take: number;
    order: { created_at: "DESC" };
    relations: string[];
  }): Promise<[Task[], number]> {
    return this.repo.findAndCount(options);
  }

  findOne(options: {
    where: { id: string };
    relations: string[];
  }): Promise<Task | null> {
    return this.repo.findOne(options);
  }

  remove(task: Task): Promise<Task> {
    return this.repo.remove(task);
  }
}

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private repo: Repository<Comment>,
  ) {}

  create(data: Partial<Comment>): Comment {
    return this.repo.create(data);
  }

  save(comment: Comment): Promise<Comment> {
    return this.repo.save(comment);
  }

  findAndCount(options: {
    where: { taskId: string };
    skip: number;
    take: number;
    order: { created_at: "DESC" };
  }): Promise<[Comment[], number]> {
    return this.repo.findAndCount(options);
  }
}

@Injectable()
export class TaskHistoryRepository implements ITaskHistoryRepository {
  constructor(
    @InjectRepository(TaskHistory)
    private repo: Repository<TaskHistory>,
  ) {}

  create(data: Partial<TaskHistory>): TaskHistory {
    return this.repo.create(data);
  }

  save(history: TaskHistory): Promise<TaskHistory> {
    return this.repo.save(history);
  }

  find(options: {
    where: { taskId: string };
    order: { created_at: "DESC" };
  }): Promise<TaskHistory[]> {
    return this.repo.find(options);
  }
}
