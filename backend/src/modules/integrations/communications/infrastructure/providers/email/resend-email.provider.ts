import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider } from '../../../domain/interfaces/email-provider.interface';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || 're_mock123_not_for_prod';
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = true): Promise<boolean> {
    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@imperioerp.com';
      
      await this.resend.emails.send({
        from,
        to,
        subject,
        ...(isHtml ? { html: body } : { text: body })
      });

      this.logger.log(`Email sent to ${to} via Resend`);
      return true;
    } catch (error) {
      this.logger.error(`Resend error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
