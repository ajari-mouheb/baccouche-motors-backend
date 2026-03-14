import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { throwError } from 'rxjs';

/**
 * Converts HttpException to payload so errors are properly serialized
 * over RabbitMQ and propagated to the gateway with statusCode + message.
 * Must return Observable (throwError), not throw - per NestJS microservice exception filters.
 */
@Catch(HttpException)
export class HttpToRpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpToRpcExceptionFilter.name);

  catch(exception: HttpException, _host: ArgumentsHost) {
    const status = exception.getStatus();
    const response = exception.getResponse();
    const payload =
      typeof response === 'object' && response !== null
        ? { ...response, statusCode: (response as { statusCode?: number }).statusCode ?? status }
        : { statusCode: status, message: response };
    this.logger.warn(`RPC error: ${status} - ${JSON.stringify(payload)}`);
    return throwError(() => payload);
  }
}
