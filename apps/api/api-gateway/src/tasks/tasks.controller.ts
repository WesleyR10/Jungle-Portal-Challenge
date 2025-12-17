import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
  Query,
  UseGuards,
  Req,
  OnModuleInit,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  PaginationDto,
} from '@jungle/types'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

class TaskHistoryParamsDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string
}
import { lastValueFrom, timeout } from 'rxjs'
import { JwtAuthGuard } from '@jungle/auth-module'
import { Request } from 'express'

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tasks')
export class TasksController implements OnModuleInit {
  constructor(
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy
  ) {}

  async onModuleInit() {
    await this.tasksClient.connect()
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request) {
    const userId = req.user?.['userId']
    const assigneeIds = createTaskDto.assigneeIds?.length
      ? createTaskDto.assigneeIds
      : userId
        ? [userId]
        : []

    try {
      return await lastValueFrom(
        this.tasksClient
          .send('tasks.create', { ...createTaskDto, assigneeIds })
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }

  @Get()
  @ApiOperation({ summary: 'List tasks with pagination' })
  @ApiResponse({ status: 200, description: 'Return list of tasks.' })
  async findAll(@Query() query: PaginationDto) {
    try {
      return await lastValueFrom(
        this.tasksClient
          .send('tasks.findAll', {
            page: query.page || 1,
            size: query.size || 10,
          })
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiResponse({ status: 200, description: 'Return the task.' })
  async findOne(@Param('id') id: string) {
    try {
      return await lastValueFrom(
        this.tasksClient
          .send('tasks.findOne', id)
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      const upstreamError = err?.error ?? err
      const upstreamStatus = upstreamError?.statusCode ?? upstreamError?.status
      const upstreamMessage = upstreamError?.message
      if (
        upstreamStatus === 404 ||
        (typeof upstreamMessage === 'string' &&
          upstreamMessage.includes('not found'))
      ) {
        throw new NotFoundException('Task não encontrada')
      }
      throw err
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get task history' })
  @ApiResponse({ status: 200, description: 'Return task history entries.' })
  getHistory(@Param() params: TaskHistoryParamsDto) {
    return lastValueFrom(
      this.tasksClient.send({ cmd: 'tasks.history' }, { taskId: params.id })
    )
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req: Request
  ) {
    try {
      return await lastValueFrom(
        this.tasksClient
          .send('tasks.update', {
            id,
            data: { ...updateTaskDto, userId: req.user?.['userId'] },
          })
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' })
  async remove(@Param('id') id: string) {
    try {
      return await lastValueFrom(
        this.tasksClient.send('tasks.remove', id).pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully.' })
  async addComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ) {
    try {
      return await lastValueFrom(
        this.tasksClient
          .send('tasks.addComment', {
            taskId,
            data: { ...createCommentDto, authorId: req.user?.['userId'] },
          })
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments for a task' })
  @ApiResponse({ status: 200, description: 'Return list of comments.' })
  async findComments(
    @Param('id') taskId: string,
    @Query() query: PaginationDto
  ) {
    try {
      return await lastValueFrom(
        this.tasksClient
          .send({ cmd: 'find_comments' }, { taskId, ...query })
          .pipe(timeout({ each: 10000 }))
      )
    } catch (err: any) {
      if (err?.name === 'TimeoutError') {
        throw new HttpException('Gateway Timeout', HttpStatus.GATEWAY_TIMEOUT)
      }
      throw err
    }
  }
}
