import { Injectable, Inject } from "@nestjs/common";
import { NotificationsGateway } from "./notifications.gateway";
import {
  INotificationsRepository,
  NOTIFICATIONS_REPOSITORY,
} from "./notifications.repository";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private repo: INotificationsRepository,
    private gateway: NotificationsGateway,
  ) {}

  async createAndNotify(data: {
    userId: string;
    type: string;
    message: string;
    payload?: any;
  }) {
    const notification = this.repo.create({
      userId: data.userId,
      type: data.type,
      message: data.message,
    });
    const saved = await this.repo.save(notification);

    this.gateway.notifyUser(data.userId, { ...saved, ...data.payload });
    return saved;
  }
}
