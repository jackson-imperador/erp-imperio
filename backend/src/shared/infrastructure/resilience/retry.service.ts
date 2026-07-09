import { Injectable, Logger } from "@nestjs/common";

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    let delayMs = options.delayMs ?? 1000;
    const backoffMultiplier = options.backoffMultiplier ?? 2;

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          this.logger.error(
            `Operation failed after ${maxRetries} retries`,
            error,
          );
          throw error;
        }
        this.logger.warn(
          `Operation failed, retrying in ${delayMs}ms... (Attempt ${attempt} of ${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= backoffMultiplier;
      }
    }
    throw new Error("Unreachable code");
  }
}
