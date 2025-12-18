import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger("NotificationsGateway");

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} User: ${userId}`);
    } else {
      this.logger.warn(`Client connected without userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("task:join")
  handleJoinTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    if (!data?.taskId) return;
    const room = `task:${data.taskId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage("task:leave")
  handleLeaveTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    if (!data?.taskId) return;
    const room = `task:${data.taskId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  @SubscribeMessage("task:typing")
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    if (!data?.taskId) return;
    const userId = client.data.userId as string | undefined;
    if (!userId) return;
    client.broadcast.emit("task:typing", { taskId: data.taskId, userId });
  }

  @SubscribeMessage("board:join")
  handleJoinBoard(@ConnectedSocket() client: Socket) {
    client.join("board");
    this.logger.log(`Client ${client.id} joined room board`);
  }

  @SubscribeMessage("board:leave")
  handleLeaveBoard(@ConnectedSocket() client: Socket) {
    client.leave("board");
    this.logger.log(`Client ${client.id} left room board`);
  }

  notifyUser(userId: string, payload: any) {
    const room = `user:${userId}`;

    this.logger.log(
      `Emitting notification to room ${room} for notification ${payload.id}`,
    );

    this.server.to(room).emit("notification", payload);
  }
}
