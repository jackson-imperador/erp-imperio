import { SendSmsDto } from '../../domain/dtos/send-sms.dto';

export class SendSmsCommand {
  constructor(public readonly payload: SendSmsDto) {}
}
