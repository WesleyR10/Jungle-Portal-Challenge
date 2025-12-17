import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    let error: any = exception

    if (exception instanceof RpcException) {
      error = exception.getError()
    }

    let status: number
    let message: string

    if (error instanceof HttpException) {
      status = error.getStatus()
      const res = error.getResponse() as any
      if (typeof res === 'string') {
        message = res
      } else {
        message = res?.message || error.message
      }
    } else {
      const rawStatus = error && (error.statusCode ?? error.status)
      if (
        typeof rawStatus === 'number' &&
        Number.isInteger(rawStatus) &&
        rawStatus >= 100 &&
        rawStatus <= 599
      ) {
        status = rawStatus
      }
      if (typeof error === 'string') {
        message = error
      } else {
        message = (error && error.message) || 'Internal server error'
      }
    }

    if (Array.isArray(message)) {
      message = message[0]
    }

    if (message === 'Email already registered') {
      message = 'E-mail já cadastrado'
      status = HttpStatus.CONFLICT
    }

    if (message === 'Invalid credentials') {
      message = 'Credenciais inválidas'
      status = HttpStatus.UNAUTHORIZED
    }

    if (message === 'Invalid or expired refresh token') {
      message = 'Token de refresh inválido ou expirado'
      status = HttpStatus.UNAUTHORIZED
    }

    if (
      typeof message === 'string' &&
      message.startsWith('Task #') &&
      message.endsWith(' not found')
    ) {
      status = HttpStatus.NOT_FOUND
      message = 'Task não encontrada'
    }

    if (!status) {
      status = HttpStatus.INTERNAL_SERVER_ERROR
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: status >= 500 ? 'InternalServerError' : 'UpstreamServiceError',
    })
  }
}
