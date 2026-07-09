import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider } from '../../../domain/interfaces/whatsapp-provider.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const token = this.configService.get<string>('META_WHATSAPP_TOKEN') || '';
      const phoneId = this.configService.get<string>('META_PHONE_NUMBER_ID') || '';
      const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;

      await axios.post(url, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      this.logger.log(`WhatsApp message sent to ${to} via Meta Cloud API`);
      return true;
    } catch (error) {
      this.logger.error(`Meta WhatsApp error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
