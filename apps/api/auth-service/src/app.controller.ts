import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AuthService } from "./auth/auth.service";
import { RegisterDto, LoginDto, RefreshDto } from "@jungle/types";
import { UsersService } from "./users/users.service";
import { UserListItemDto } from "./users/dto/list-users.dto";

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @MessagePattern({ cmd: "register" })
  async register(@Payload() data: RegisterDto) {
    console.log("[auth-service] register payload", { email: data.email });
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: "login" })
  async login(@Payload() data: LoginDto) {
    console.log("[auth-service] login payload", { email: data.email });
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: "refresh" })
  async refresh(@Payload() data: RefreshDto) {
    return this.authService.verifyAndRefresh(data.refreshToken);
  }

  @MessagePattern({ cmd: "list_users" })
  async listUsers(): Promise<UserListItemDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
  }
}
