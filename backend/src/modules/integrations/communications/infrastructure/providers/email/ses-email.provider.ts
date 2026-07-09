import { Injectable, Logger } from '@nestjs/common';
import { IEmailProvider } from '../../../domain/interfaces/email-provider.interface';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SesEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(SesEmailProvider.name);
  private readonly sesClient: SESClient;

  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      }
    });
  }

  async sendEmail(to: string, subject: string, body: string, isHtml: boolean = true): Promise<boolean> {
    try {
      const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@imperioerp.com';
      
      const command = new SendEmailCommand({
        Destination: { ToAddresses: [to] },
        Message: {
          Body: {
            ...(isHtml ? { Html: { Data: body, Charset: 'UTF-8' } } : { Text: { Data: body, Charset: 'UTF-8' } })
          },
          Subject: { Data: subject, Charset: 'UTF-8' }
        },
        Source: from,
      });

      await this.sesClient.send(command);
      this.logger.log(`Email sent to ${to} via AWS SES`);
      return true;
    } catch (error) {
      this.logger.error(`SES error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
