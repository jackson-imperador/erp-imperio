import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  async execute<T>(action: () => Promise<T>, retries: number = 3, delayMs: number = 1000): Promise<T> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await action();
      } catch (error) {
        attempt++;
        this.logger.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);
        if (attempt >= retries) {
          this.logger.error(`Max retries reached. Action failed.`);
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Retry execution failed');
  }
}
