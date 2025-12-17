import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsGateway } from "./notifications.gateway";
import { Notification } from "./entities/notification.entity";
import { CommonAuthModule } from "@jungle/auth-module";
import {
  NOTIFICATIONS_REPOSITORY,
  NotificationsRepository,
} from "./notifications.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    CommonAuthModule, // For potential JWT validation on WS if needed
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsRepository,
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useExisting: NotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
