import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider } from '../../../domain/interfaces/email-provider.interface';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendgridEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SendgridEmailProvider.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = true): Promise<boolean> {
    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@imperioerp.com';
      const msg = {
        to,
        from,
        subject,
        text: isHtml ? undefined : body,
        html: isHtml ? body : undefined,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent to ${to} via SendGrid`);
      return true;
    } catch (error) {
      this.logger.error(`SendGrid error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
