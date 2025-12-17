import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class InitTasks1734020000000 implements MigrationInterface {
  name = "InitTasks1734020000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.createTable(
      new Table({
        name: "task",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "title",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
            isNullable: true,
          },
          {
            name: "dueDate",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "status",
            type: "varchar",
            isNullable: false,
            default: `'TODO'`,
          },
          {
            name: "priority",
            type: "varchar",
            isNullable: false,
            default: `'MEDIUM'`,
          },
          {
            name: "assigneeIds",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "comment",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "taskId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "authorId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "comment",
      new TableForeignKey({
        columnNames: ["taskId"],
        referencedTableName: "task",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "task_history",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "taskId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "action",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "changes",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "performedBy",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "task_history",
      new TableForeignKey({
        columnNames: ["taskId"],
        referencedTableName: "task",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const taskHistoryTable = await queryRunner.getTable("task_history");
    const taskHistoryFk = taskHistoryTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes("taskId"),
    );
    if (taskHistoryFk) {
      await queryRunner.dropForeignKey("task_history", taskHistoryFk);
    }
    await queryRunner.dropTable("task_history");

    const commentTable = await queryRunner.getTable("comment");
    const commentFk = commentTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes("taskId"),
    );
    if (commentFk) {
      await queryRunner.dropForeignKey("comment", commentFk);
    }
    await queryRunner.dropTable("comment");

    await queryRunner.dropTable("task");
  }
}
