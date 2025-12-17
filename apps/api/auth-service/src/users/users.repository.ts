import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

export interface IUsersRepository {
  create(data: Partial<User>): User;
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findOne(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

export const USERS_REPOSITORY = Symbol("USERS_REPOSITORY");

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  create(data: Partial<User>): User {
    return this.repo.create(data);
  }

  save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ order: { name: "ASC" } });
  }
}
