import { Injectable, Logger } from "@nestjs/common";

export enum CircuitBreakerState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number | null = null;

  private readonly failureThreshold: number = 5;
  private readonly resetTimeoutMs: number = 10000;

  constructor() {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > this.resetTimeoutMs
      ) {
        this.logger.log("Circuit breaker entering HALF_OPEN state");
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (
      this.state === CircuitBreakerState.HALF_OPEN ||
      this.failureCount >= this.failureThreshold
    ) {
      this.logger.warn(
        `Circuit breaker opened after ${this.failureCount} failures`,
      );
      this.state = CircuitBreakerState.OPEN;
    }
  }

  private reset(): void {
    if (this.state !== CircuitBreakerState.CLOSED) {
      this.logger.log("Circuit breaker reset to CLOSED");
    }
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}
