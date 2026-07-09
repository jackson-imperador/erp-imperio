import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from '../../../domain/interfaces/sms-provider.interface';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly client: Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.client = new Twilio(accountSid, authToken);
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      const from = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';
      await this.client.messages.create({
        body: message,
        from,
        to
      });
      this.logger.log(`SMS sent to ${to} via Twilio`);
      return true;
    } catch (error) {
      this.logger.error(`Twilio error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
