import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UsersRepository, USERS_REPOSITORY } from "./users.repository";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    UsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: UsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
