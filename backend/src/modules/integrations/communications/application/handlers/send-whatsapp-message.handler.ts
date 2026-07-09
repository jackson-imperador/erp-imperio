import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendWhatsAppMessageCommand } from '../commands/send-whatsapp-message.command';
import { WhatsAppProviderFactory } from '../../infrastructure/providers/whatsapp/whatsapp-provider.factory';
import { CircuitBreakerService } from '../../infrastructure/resiliency/circuit-breaker.service';
import { RetryService } from '../../infrastructure/resiliency/retry.service';

@CommandHandler(SendWhatsAppMessageCommand)
export class SendWhatsAppMessageHandler implements ICommandHandler<SendWhatsAppMessageCommand> {
  constructor(
    private readonly whatsAppFactory: WhatsAppProviderFactory,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly retry: RetryService
  ) {}

  async execute(command: SendWhatsAppMessageCommand): Promise<boolean> {
    const { to, message, provider } = command.payload;
    const waProvider = this.whatsAppFactory.getProvider(provider);
    
    return this.circuitBreaker.execute(() => 
      this.retry.execute(() => waProvider.sendMessage(to, message))
    );
  }
}
