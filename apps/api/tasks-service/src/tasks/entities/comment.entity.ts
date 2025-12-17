import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Task } from "./task.entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  content: string;

  @Column()
  authorId: string; // User ID

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  task: Task;

  @Column()
  taskId: string;

  @CreateDateColumn()
  created_at: Date;
}
