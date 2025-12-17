import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { NotificationsService } from "./notifications.service";
import { Task, Comment } from "@jungle/types";

@Controller()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

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
  }
}
