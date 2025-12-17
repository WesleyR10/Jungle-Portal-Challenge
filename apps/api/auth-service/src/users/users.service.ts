import { Injectable, Inject } from "@nestjs/common";
import { RegisterDto } from "@jungle/types";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { IUsersRepository, USERS_REPOSITORY } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: IUsersRepository,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = this.usersRepository.create({
      email: registerDto.email,
      name: registerDto.username,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
}
