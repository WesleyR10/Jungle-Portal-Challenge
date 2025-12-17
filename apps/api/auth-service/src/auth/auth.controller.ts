import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, JwtPayload } from "@jungle/types";
import { JwtAuthGuard } from "@jungle/auth-module";
import { CurrentUser } from "./decorators/current-user.decorator";
import { UsersService } from "../users/users.service";
import { UserListItemDto } from "../users/dto/list-users.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post("register")
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh")
  refresh(@CurrentUser() user: JwtPayload) {
    return this.authService.refreshToken(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("users")
  async listUsers(): Promise<UserListItemDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
    }));
  }
}
