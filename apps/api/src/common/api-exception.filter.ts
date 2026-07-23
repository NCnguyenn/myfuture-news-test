import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';

type ErrorPayload = {
  message?: string | string[];
  code?: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const rawPayload = exception instanceof HttpException ? exception.getResponse() : null;
    const payload: ErrorPayload = typeof rawPayload === 'object' && rawPayload !== null
      ? rawPayload as ErrorPayload
      : {};
    if (!(exception instanceof HttpException)) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }
    const message = Array.isArray(payload.message)
      ? payload.message.join('; ')
      : payload.message ?? (typeof rawPayload === 'string' ? rawPayload : 'Internal server error');

    response.status(statusCode).send({
      statusCode,
      message,
      code: payload.code ?? this.defaultCode(statusCode),
    });
  }

  private defaultCode(statusCode: number): string {
    if (statusCode === HttpStatus.BAD_REQUEST) return 'INVALID_REQUEST';
    if (statusCode === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    return 'INTERNAL_SERVER_ERROR';
  }
}
