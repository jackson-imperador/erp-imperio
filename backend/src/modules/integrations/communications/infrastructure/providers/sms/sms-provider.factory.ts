import { Injectable } from '@nestjs/common';
import { ISmsProvider } from '../../../domain/interfaces/sms-provider.interface';
import { SmsProviderType } from '../../../domain/dtos/send-sms.dto';
import { TwilioSmsProvider } from './twilio-sms.provider';
import { ZenviaSmsProvider } from './zenvia-sms.provider';

@Injectable()
export class SmsProviderFactory {
  constructor(
    private readonly twilio: TwilioSmsProvider,
    private readonly zenvia: ZenviaSmsProvider,
  ) {}

  getProvider(type?: SmsProviderType): ISmsProvider {
    switch (type) {
      case SmsProviderType.ZENVIA:
        return this.zenvia;
      case SmsProviderType.TWILIO:
      default:
        return this.twilio;
    }
  }
}
