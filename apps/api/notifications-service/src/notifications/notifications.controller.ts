import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationsService } from "./notifications.service";
import { Task, Comment } from "@jungle/types";
import { NotificationsGateway } from "./notifications.gateway";

@Controller()
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  @EventPattern("task.created")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleTaskCreated(@Payload() task: Task) {
    console.log("[notifications] event task.created", task.id);
    if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
      await Promise.all(
        task.assigneeIds.map((userId: string) =>
          this.service.createAndNotify({
            userId,
            type: "TASK_ASSIGNED",
            message: `New task assigned: ${task.title}`,
            payload: { taskId: task.id },
          }),
        ),
      );
    }

    const payload = {
      taskId: task.id,
      title: task.title,
    };

    this.gateway.server.to("board").emit("task:created", payload);
    this.gateway.server.emit("task:created", payload);
  }

  @EventPattern("task.updated")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleTaskUpdated(@Payload() task: Task) {
    console.log("[notifications] event task.updated", task.id);
    if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
      await Promise.all(
        task.assigneeIds.map((userId: string) =>
          this.service.createAndNotify({
            userId,
            type: "TASK_UPDATED",
            message: `Task updated: ${task.title}`,
            payload: { taskId: task.id, status: task.status },
          }),
        ),
      );
    }

    const payload = {
      taskId: task.id,
      title: task.title,
      status: task.status,
    };

    this.gateway.server.to("board").emit("task:updated", payload);
    this.gateway.server.emit("task:updated", payload);
  }

  @EventPattern("task.comment.created")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleCommentCreated(
    @Payload()
    payload: Comment & {
      taskAssigneeIds?: string[];
      taskTitle?: string;
      authorId?: string;
    },
  ) {
    if (payload.taskAssigneeIds && Array.isArray(payload.taskAssigneeIds)) {
      await Promise.all(
        payload.taskAssigneeIds.map((userId: string) =>
          this.service.createAndNotify({
            userId,
            type: "COMMENT_ADDED",
            message: `New comment on task: ${payload.taskTitle}`,
            payload: {
              taskId: payload.taskId,
              commentId: payload.id,
              authorId: payload.authorId,
            },
          }),
        ),
      );
    }

    const wsPayload = {
      taskId: payload.taskId,
      commentId: payload.id,
      authorId: payload.authorId,
    };

    this.gateway.server.to("board").emit("comment:new", wsPayload);
    this.gateway.server.emit("comment:new", wsPayload);
    this.gateway.server
      .to(`task:${payload.taskId}`)
      .emit("comment:new", wsPayload);
  }
}
