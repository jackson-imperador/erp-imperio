import { Test, TestingModule } from '@nestjs/testing';
import { EmailProviderFactory } from './email-provider.factory';
import { SendgridEmailProvider } from './sendgrid-email.provider';
import { SesEmailProvider } from './ses-email.provider';
import { ResendEmailProvider } from './resend-email.provider';
import { EmailProviderType } from '../../../domain/dtos/send-email.dto';

describe('EmailProviderFactory', () => {
  let factory: EmailProviderFactory;
  let sendgrid: SendgridEmailProvider;
  let ses: SesEmailProvider;
  let resend: ResendEmailProvider;

  beforeEach(async () => {
    const mockSendgrid = {};
    const mockSes = {};
    const mockResend = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProviderFactory,
        { provide: SendgridEmailProvider, useValue: mockSendgrid },
        { provide: SesEmailProvider, useValue: mockSes },
        { provide: ResendEmailProvider, useValue: mockResend },
      ],
    }).compile();

    factory = module.get<EmailProviderFactory>(EmailProviderFactory);
    sendgrid = module.get<SendgridEmailProvider>(SendgridEmailProvider);
    ses = module.get<SesEmailProvider>(SesEmailProvider);
    resend = module.get<ResendEmailProvider>(ResendEmailProvider);
  });

  it('should return sendgrid by default', () => {
    expect(factory.getProvider()).toBe(sendgrid);
    expect(factory.getProvider(EmailProviderType.SENDGRID)).toBe(sendgrid);
  });

  it('should return ses', () => {
    expect(factory.getProvider(EmailProviderType.SES)).toBe(ses);
  });

  it('should return resend', () => {
    expect(factory.getProvider(EmailProviderType.RESEND)).toBe(resend);
  });
});
