import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  LoggerService,
} from "@nestjs/common";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorId = uuidv4();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(
      `[${errorId}] Unhandled exception on ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception),
      "AllExceptionsFilter",
    );

    response.status(status).json({
      success: false,
      errorId,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        "An unexpected error occurred. Please try again or contact support.",
      correlationId: (request.headers["x-correlation-id"] as string) || errorId,
    });
  }
}
