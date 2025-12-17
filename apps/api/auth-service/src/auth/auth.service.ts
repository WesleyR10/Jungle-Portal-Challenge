import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterDto, LoginDto, LoginResponse } from "@jungle/types";
import { RpcException } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import type { StringValue } from "ms";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const exists = await this.usersService.findByEmail(registerDto.email);
    if (exists) {
      throw new RpcException(new ConflictException("Email already registered"));
    }
    const user = await this.usersService.create(registerDto);
    const { passwordHash, ...result } = user;
    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new RpcException(new UnauthorizedException("Invalid credentials"));
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        "JWT_REFRESH_EXPIRES_IN",
      ) as StringValue,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(user: any): Promise<{ accessToken: string }> {
    const payload = { email: user.email, sub: user.userId };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async verifyAndRefresh(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new RpcException(new UnauthorizedException("User not found"));
      }

      const newPayload = { email: user.email, sub: user.id };
      // Opcional: Rotacionar o refresh token também, por segurança
      return {
        accessToken: this.jwtService.sign(newPayload),
        // Se quiséssemos rotacionar o refresh token a cada uso:
        // refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' })
      };
    } catch (e) {
      throw new RpcException(
        new UnauthorizedException("Invalid or expired refresh token"),
      );
    }
  }
}
