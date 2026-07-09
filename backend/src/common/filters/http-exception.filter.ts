import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from "@nestjs/common";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorId = uuidv4();

    const errorBody =
      typeof exceptionResponse === "string"
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    const responseBody = {
      success: false,
      errorId,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId: (request.headers["x-correlation-id"] as string) || errorId,
      ...errorBody,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${errorId}] ${request.method} ${request.url} — ${status}`,
        exception.stack,
        "HttpExceptionFilter",
      );
    } else {
      this.logger.warn(
        `[${errorId}] ${request.method} ${request.url} — ${status}: ${exception.message}`,
        "HttpExceptionFilter",
      );
    }

    response.status(status).json(responseBody);
  }
}
