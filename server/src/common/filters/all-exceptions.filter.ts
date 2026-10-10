import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { isProduction } from '../../config/env';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status >= 500)
        this.logger.error(`${request.method} ${request.url}`, exception.stack);
      response.status(status).json(exception.getResponse());
      return;
    }

    const stack =
      exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(`${request.method} ${request.url}`, stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction ? 'Erreur interne' : String(exception),
    });
  }
}
