import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitNotifications1734020200000 implements MigrationInterface {
  name = "InitNotifications1734020200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notification",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "message",
            type: "text",
            isNullable: false,
          },
          {
            name: "read",
            type: "boolean",
            isNullable: false,
            default: false,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("notification");
  }
}
