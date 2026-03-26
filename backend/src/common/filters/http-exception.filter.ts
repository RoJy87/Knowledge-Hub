import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string | string[];
}

/**
 * Global HTTP Exception Filter
 * Handles all HTTP exceptions and returns a standardized error response
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message || exception.getResponse()
        : 'Internal server error';

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method || 'UNKNOWN',
      error: this.getErrorCode(status),
      message: this.formatMessage(message),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Get error code string from status code
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    return errorCodes[status] || 'Error';
  }

  /**
   * Format message - handle both string and object messages
   */
  private formatMessage(message: unknown): string | string[] {
    if (typeof message === 'string') {
      return message;
    }

    if (Array.isArray(message)) {
      return message;
    }

    if (typeof message === 'object' && message !== null) {
      // Handle validation errors from class-validator
      const errors = message as Record<string, any>;
      if (errors.message) {
        return errors.message;
      }
      if (errors.errors) {
        return errors.errors;
      }
    }

    return 'An unexpected error occurred';
  }
}
