import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { TasksService } from "./tasks.service";
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  PaginationDto,
} from "@jungle/types";

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern("tasks.create")
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @MessagePattern("tasks.findAll")
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.tasksService.findAll(paginationDto.page, paginationDto.size);
  }

  @MessagePattern("tasks.findOne")
  findOne(@Payload() id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern("tasks.update")
  update(
    @Payload()
    updateTaskDto: {
      id: string;
      data: UpdateTaskDto & { userId?: string };
    },
  ) {
    return this.tasksService.update(updateTaskDto.id, updateTaskDto.data);
  }

  @MessagePattern("tasks.remove")
  remove(@Payload() id: string) {
    return this.tasksService.remove(id);
  }

  @MessagePattern("tasks.addComment")
  addComment(
    @Payload()
    commentDto: {
      taskId: string;
      data: CreateCommentDto & { authorId: string };
    },
  ) {
    return this.tasksService.addComment(commentDto.taskId, commentDto.data);
  }

  @MessagePattern({ cmd: "find_comments" })
  findComments(
    @Payload() payload: { taskId: string; page?: number; size?: number },
  ) {
    return this.tasksService.findComments(
      payload.taskId,
      payload.page ?? 1,
      payload.size ?? 10,
    );
  }

  @MessagePattern({ cmd: "tasks.history" })
  getHistory(@Payload() payload: { taskId: string }) {
    return this.tasksService.getHistory(payload.taskId);
  }
}
