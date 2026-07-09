import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  LoggerService,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const correlationId = headers["x-correlation-id"] || "-";
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const status = context.switchToHttp().getResponse().statusCode;

          if (duration > 2000) {
            this.logger.warn(
              `[${correlationId}] ${method} ${url} ${status} — ${duration}ms ⚠️ SLOW`,
              "LoggingInterceptor",
            );
          } else {
            this.logger.log(
              `[${correlationId}] ${method} ${url} ${status} — ${duration}ms`,
              "LoggingInterceptor",
            );
          }
        },
        error: () => {
          const duration = Date.now() - start;
          this.logger.error(
            `[${correlationId}] ${method} ${url} ERROR — ${duration}ms`,
            undefined,
            "LoggingInterceptor",
          );
        },
      }),
    );
  }
}
