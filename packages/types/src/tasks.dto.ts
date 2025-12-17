import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  IsInt,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { TaskPriority, TaskStatus } from "./tasks";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({ example: "Implement login feature" })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiPropertyOptional({ example: "Create login page using React Hook Form" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "2023-12-31" })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: ["user-uuid-1", "user-uuid-2"] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  assigneeIds!: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: "Implement login feature (Updated)" })
  @IsString()
  @MinLength(3)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigneeIds?: string[];
}

export class CreateCommentDto {
  @ApiProperty({ example: "This is a comment" })
  @IsString()
  @MinLength(1)
  content!: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  size: number = 10;
}
