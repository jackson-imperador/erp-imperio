import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailHandler } from './send-email.handler';
import { EmailProviderFactory } from '../../infrastructure/providers/email/email-provider.factory';
import { CircuitBreakerService } from '../../infrastructure/resiliency/circuit-breaker.service';
import { RetryService } from '../../infrastructure/resiliency/retry.service';
import { SendEmailCommand } from '../commands/send-email.command';
import { EmailProviderType } from '../../domain/dtos/send-email.dto';

describe('SendEmailHandler', () => {
  let handler: SendEmailHandler;
  let factory: EmailProviderFactory;
  let circuitBreaker: CircuitBreakerService;
  let retry: RetryService;

  beforeEach(async () => {
    const mockFactory = {
      getProvider: jest.fn().mockReturnValue({
        sendEmail: jest.fn().mockResolvedValue(true)
      })
    };
    const mockCircuitBreaker = {
      execute: jest.fn().mockImplementation((fn) => fn())
    };
    const mockRetry = {
      execute: jest.fn().mockImplementation((fn) => fn())
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailHandler,
        { provide: EmailProviderFactory, useValue: mockFactory },
        { provide: CircuitBreakerService, useValue: mockCircuitBreaker },
        { provide: RetryService, useValue: mockRetry },
      ],
    }).compile();

    handler = module.get<SendEmailHandler>(SendEmailHandler);
    factory = module.get<EmailProviderFactory>(EmailProviderFactory);
    circuitBreaker = module.get<CircuitBreakerService>(CircuitBreakerService);
    retry = module.get<RetryService>(RetryService);
  });

  it('should execute send email command', async () => {
    const command = new SendEmailCommand({
      to: 'test@test.com',
      subject: 'Test',
      body: 'Hello',
      provider: EmailProviderType.SENDGRID
    });

    const result = await handler.execute(command);
    expect(result).toBe(true);
    expect(factory.getProvider).toHaveBeenCalledWith(EmailProviderType.SENDGRID);
    expect(circuitBreaker.execute).toHaveBeenCalled();
    expect(retry.execute).toHaveBeenCalled();
  });
});
