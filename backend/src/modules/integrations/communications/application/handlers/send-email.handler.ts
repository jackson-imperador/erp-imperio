import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from '../commands/send-email.command';
import { EmailProviderFactory } from '../../infrastructure/providers/email/email-provider.factory';
import { CircuitBreakerService } from '../../infrastructure/resiliency/circuit-breaker.service';
import { RetryService } from '../../infrastructure/resiliency/retry.service';

@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
  constructor(
    private readonly emailFactory: EmailProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retry: RetryService
  ) {}

  async execute(command: SendEmailCommand): Promise<boolean> {
    const { to, subject, body, isHtml, provider } = command.payload;
    const emailProvider = this.emailFactory.getProvider(provider);
    
    return this.circuitBreaker.execute(() => 
      this.retry.execute(() => emailProvider.sendEmail(to, subject, body, isHtml))
    );
  }
}
