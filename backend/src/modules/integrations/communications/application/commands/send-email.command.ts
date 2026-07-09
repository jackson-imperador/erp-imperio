import { SendEmailDto } from '../../domain/dtos/send-email.dto';

export class SendEmailCommand {
  constructor(public readonly payload: SendEmailDto) {}
}
