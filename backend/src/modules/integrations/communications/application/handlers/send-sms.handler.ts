import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendSmsCommand } from '../commands/send-sms.command';
import { SmsProviderFactory } from '../../infrastructure/providers/sms/sms-provider.factory';
import { CircuitBreakerService } from '../../infrastructure/resiliency/circuit-breaker.service';
import { RetryService } from '../../infrastructure/resiliency/retry.service';

@CommandHandler(SendSmsCommand)
export class SendSmsHandler implements ICommandHandler<SendSmsCommand> {
  constructor(
    private readonly smsFactory: SmsProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retry: RetryService
  ) {}

  async execute(command: SendSmsCommand): Promise<boolean> {
    const { to, message, provider } = command.payload;
    const smsProvider = this.smsFactory.getProvider(provider);
    
    return this.circuitBreaker.execute(() => 
      this.retry.execute(() => smsProvider.sendSms(to, message))
    );
  }
}
