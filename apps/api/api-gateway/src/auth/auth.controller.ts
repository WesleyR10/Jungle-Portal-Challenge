import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  Get,
  UseGuards,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { RegisterDto, LoginDto, RefreshDto } from '@jungle/types'
import { JwtAuthGuard } from '@jungle/auth-module'
import { lastValueFrom } from 'rxjs'
import { RpcException } from '@nestjs/microservices'

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('api/auth')
export class AuthController implements OnModuleInit {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy
  ) {}

  async onModuleInit() {
    await this.authClient.connect()
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await lastValueFrom(
        this.authClient.send({ cmd: 'register' }, registerDto)
      )
    } catch (err: any) {
      const error = err instanceof RpcException ? err.getError() : err
      const message = error?.message || error?.error || err?.message

      if (message === 'Email already registered') {
        throw new ConflictException('E-mail já cadastrado')
      }

      throw err
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() loginDto: LoginDto) {
    try {
      return await lastValueFrom(
        this.authClient.send({ cmd: 'login' }, loginDto)
      )
    } catch (err: any) {
      const error = err instanceof RpcException ? err.getError() : err
      const message = error?.message || error?.error || err?.message

      if (message === 'Invalid credentials') {
        throw new UnauthorizedException('Credenciais inválidas')
      }

      throw err
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed.' })
  async refresh(@Body() dto: RefreshDto) {
    try {
      return await lastValueFrom(this.authClient.send({ cmd: 'refresh' }, dto))
    } catch (err: any) {
      const error = err instanceof RpcException ? err.getError() : err
      const message = error?.message || error?.error || err?.message

      if (message === 'Invalid or expired refresh token') {
        throw new UnauthorizedException('Token de refresh inválido ou expirado')
      }

      throw err
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiOperation({ summary: 'List users for task assignment' })
  @ApiResponse({ status: 200, description: 'Return list of users.' })
  async listUsers() {
    return lastValueFrom(this.authClient.send({ cmd: 'list_users' }, {}))
  }
}
