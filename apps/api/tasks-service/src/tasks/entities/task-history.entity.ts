import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Task } from "./task.entity";

export type TaskHistoryChanges = Record<
  string,
  {
    old: unknown;
    new: unknown;
  }
>;

@Entity()
export class TaskHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  action: string; // 'CREATED', 'UPDATED', 'COMMENT_ADDED', etc.

  @Column({ type: "jsonb", nullable: true })
  changes: TaskHistoryChanges | null; // { field: { old: 'val', new: 'val' } }

  @Column()
  performedBy: string; // User ID

  @ManyToOne(() => Task, { onDelete: "CASCADE" })
  task: Task;

  @Column()
  taskId: string;

  @CreateDateColumn()
  created_at: Date;
}
