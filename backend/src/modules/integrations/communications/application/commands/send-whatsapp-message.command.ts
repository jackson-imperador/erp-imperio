import { SendWhatsAppDto } from '../../domain/dtos/send-whatsapp.dto';

export class SendWhatsAppMessageCommand {
  constructor(public readonly payload: SendWhatsAppDto) {}
}
