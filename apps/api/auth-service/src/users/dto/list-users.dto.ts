import { ApiProperty } from "@nestjs/swagger";

export class UserListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;
}
