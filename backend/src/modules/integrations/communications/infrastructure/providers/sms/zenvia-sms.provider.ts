import { Injectable, Logger } from '@nestjs/common';
import { ISmsProvider } from '../../../domain/interfaces/sms-provider.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ZenviaSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(ZenviaSmsProvider.name);
  private readonly apiUrl = 'https://api.zenvia.com/v2/channels/sms/messages';

  constructor(private readonly configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<boolean> {
    try {
      const token = this.configService.get<string>('ZENVIA_API_TOKEN') || '';
      const from = this.configService.get<string>('ZENVIA_SENDER_ID') || '';

      await axios.post(this.apiUrl, {
        from,
        to,
        contents: [
          { type: 'text', text: message }
        ]
      }, {
        headers: {
          'X-API-TOKEN': token,
          'Content-Type': 'application/json'
        }
      });
      
      this.logger.log(`SMS sent to ${to} via Zenvia`);
      return true;
    } catch (error) {
      this.logger.error(`Zenvia error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
