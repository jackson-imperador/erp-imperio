import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider } from '../../../domain/interfaces/whatsapp-provider.interface';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EvolutionWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(EvolutionWhatsAppProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const url = this.configService.get<string>('EVOLUTION_API_URL') || '';
      const apiKey = this.configService.get<string>('EVOLUTION_API_KEY') || '';
      const instance = this.configService.get<string>('EVOLUTION_INSTANCE_NAME') || '';
      
      const fullUrl = `${url}/message/sendText/${instance}`;

      await axios.post(fullUrl, {
        number: to,
        options: {
          delay: 1200,
          presence: "composing",
        },
        textMessage: {
          text: message
        }
      }, {
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      this.logger.log(`WhatsApp message sent to ${to} via Evolution API`);
      return true;
    } catch (error) {
      this.logger.error(`Evolution WhatsApp error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
