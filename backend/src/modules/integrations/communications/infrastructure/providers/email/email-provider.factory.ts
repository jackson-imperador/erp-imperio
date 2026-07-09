import { Injectable } from '@nestjs/common';
import { IEmailProvider } from '../../../domain/interfaces/email-provider.interface';
import { EmailProviderType } from '../../../domain/dtos/send-email.dto';
import { SendgridEmailProvider } from './sendgrid-email.provider';
import { SesEmailProvider } from './ses-email.provider';
import { ResendEmailProvider } from './resend-email.provider';

@Injectable()
export class EmailProviderFactory {
  constructor(
    private readonly sendgrid: SendgridEmailProvider,
    private readonly ses: SesEmailProvider,
    private readonly resend: ResendEmailProvider,
  ) {}

  getProvider(type?: EmailProviderType): IEmailProvider {
    switch (type) {
      case EmailProviderType.SES:
        return this.ses;
      case EmailProviderType.RESEND:
        return this.resend;
      case EmailProviderType.SENDGRID:
      default:
        return this.sendgrid;
    }
  }
}
