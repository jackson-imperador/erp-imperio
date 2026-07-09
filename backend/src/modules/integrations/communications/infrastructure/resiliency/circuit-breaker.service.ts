import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);

  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    // Basic circuit breaker simulation
    try {
      return await action();
    } catch (error) {
      this.logger.error(`Circuit Breaker open. Fallback executing due to: ${error.message}`);
      if (fallback) {
        return await fallback();
      }
      throw error;
    }
  }
}
