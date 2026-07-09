import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

import { CommunicationsController } from './presentation/controllers/communications.controller';

import { SendEmailHandler } from './application/handlers/send-email.handler';
import { SendSmsHandler } from './application/handlers/send-sms.handler';
import { SendWhatsAppMessageHandler } from './application/handlers/send-whatsapp-message.handler';

import { EmailProviderFactory } from './infrastructure/providers/email/email-provider.factory';
import { SendgridEmailProvider } from './infrastructure/providers/email/sendgrid-email.provider';
import { SesEmailProvider } from './infrastructure/providers/email/ses-email.provider';
import { ResendEmailProvider } from './infrastructure/providers/email/resend-email.provider';

import { SmsProviderFactory } from './infrastructure/providers/sms/sms-provider.factory';
import { TwilioSmsProvider } from './infrastructure/providers/sms/twilio-sms.provider';
import { ZenviaSmsProvider } from './infrastructure/providers/sms/zenvia-sms.provider';

import { WhatsAppProviderFactory } from './infrastructure/providers/whatsapp/whatsapp-provider.factory';
import { MetaWhatsAppProvider } from './infrastructure/providers/whatsapp/meta-whatsapp.provider';
import { EvolutionWhatsAppProvider } from './infrastructure/providers/whatsapp/evolution-whatsapp.provider';

import { CircuitBreakerService } from './infrastructure/resiliency/circuit-breaker.service';
import { RetryService } from './infrastructure/resiliency/retry.service';

const CommandHandlers = [SendEmailHandler, SendSmsHandler, SendWhatsAppMessageHandler];

const ResiliencyProviders = [CircuitBreakerService, RetryService];

const EmailProviders = [
  EmailProviderFactory,
  SendgridEmailProvider,
  SesEmailProvider,
  ResendEmailProvider,
];

const SmsProviders = [
  SmsProviderFactory,
  TwilioSmsProvider,
  ZenviaSmsProvider,
];

const WhatsAppProviders = [
  WhatsAppProviderFactory,
  MetaWhatsAppProvider,
  EvolutionWhatsAppProvider,
];

@Module({
  imports: [CqrsModule, ConfigModule],
  controllers: [CommunicationsController],
  providers: [
    ...CommandHandlers,
    ...ResiliencyProviders,
    ...EmailProviders,
    ...SmsProviders,
    ...WhatsAppProviders,
  ],
  exports: [
    EmailProviderFactory,
    SmsProviderFactory,
    WhatsAppProviderFactory,
  ],
})
export class CommunicationsModule {}
