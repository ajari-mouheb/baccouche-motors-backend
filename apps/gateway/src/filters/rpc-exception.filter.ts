import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';

/** Extracts status + body from RPC/microservice errors */
function extractErrorPayload(error: unknown): {
  statusCode: number;
  message: string | string[];
  error?: string;
} {
  if (error instanceof HttpException) {
    const res = error.getResponse();
    const status = error.getStatus();
    if (typeof res === 'object' && res !== null) {
      const r = res as { message?: string | string[]; error?: string };
      return {
        statusCode: status,
        message: r.message ?? 'Error',
        error: r.error,
      };
    }
    return { statusCode: status, message: String(res) };
  }
  if (error instanceof RpcException) {
    const payload = error.getError();
    if (typeof payload === 'object' && payload !== null && 'statusCode' in payload) {
      const p = payload as { statusCode?: number; message?: string; error?: string };
      return {
        statusCode: p.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
        message: p.message ?? 'Internal server error',
        error: p.error,
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: typeof payload === 'string' ? payload : 'Internal server error',
    };
  }
  if (error instanceof Error) {
    // RMQ may nest the payload in error.response
    const err = error as Error & { response?: unknown };
    if (err.response && typeof err.response === 'object') {
      const r = err.response as { statusCode?: number; message?: string; error?: string };
      if (typeof r.statusCode === 'number') {
        return {
          statusCode: r.statusCode,
          message: r.message ?? 'Internal server error',
          error: r.error,
        };
      }
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: err.message || 'Internal server error',
    };
  }
  // Plain object payload from throwError() in microservice filters
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const p = error as { statusCode?: number; message?: string | string[]; error?: string };
    if (typeof p.statusCode === 'number') {
      return {
        statusCode: p.statusCode,
        message: p.message ?? 'Internal server error',
        error: p.error,
      };
    }
  }
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
  };
}

/**
 * Catches RpcException and other errors from Kafka RPC calls.
 * Logs the error and maps microservice status codes to HTTP responses.
 */
@Catch(HttpException, RpcException, Error)
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    const { statusCode, message, error } = extractErrorPayload(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `Error: ${statusCode} - ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: Record<string, unknown> = { statusCode, message };
    if (error) body.error = error;
    res.status(statusCode).json(body);
  }
}
