import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { SendEmailDto } from '../../domain/dtos/send-email.dto';
import { SendSmsDto } from '../../domain/dtos/send-sms.dto';
import { SendWhatsAppDto } from '../../domain/dtos/send-whatsapp.dto';

import { SendEmailCommand } from '../../application/commands/send-email.command';
import { SendSmsCommand } from '../../application/commands/send-sms.command';
import { SendWhatsAppMessageCommand } from '../../application/commands/send-whatsapp-message.command';

@ApiTags('Communications')
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendEmail(@Body() dto: SendEmailDto): Promise<{ success: boolean }> {
    const result = await this.commandBus.execute(new SendEmailCommand(dto));
    return { success: result };
  }

  @Post('sms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an SMS' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendSms(@Body() dto: SendSmsDto): Promise<{ success: boolean }> {
    const result = await this.commandBus.execute(new SendSmsCommand(dto));
    return { success: result };
  }

  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a WhatsApp message' })
  @ApiResponse({ status: 200, description: 'WhatsApp message sent successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendWhatsApp(@Body() dto: SendWhatsAppDto): Promise<{ success: boolean }> {
    const result = await this.commandBus.execute(new SendWhatsAppMessageCommand(dto));
    return { success: result };
  }
}
