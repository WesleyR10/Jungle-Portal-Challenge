import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entities/notification.entity";

export interface INotificationsRepository {
  create(data: Partial<Notification>): Notification;
  save(notification: Notification): Promise<Notification>;
}

export const NOTIFICATIONS_REPOSITORY = Symbol("NOTIFICATIONS_REPOSITORY");

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  create(data: Partial<Notification>): Notification {
    return this.repo.create(data);
  }

  save(notification: Notification): Promise<Notification> {
    return this.repo.save(notification);
  }
}
