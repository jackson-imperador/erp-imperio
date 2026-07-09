import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SendDocumentDto } from '../../domain/dtos/send-document.dto';
import { CancelSignatureDto } from '../../domain/dtos/cancel-signature.dto';
import { SendDocumentForSignatureCommand } from '../../domain/commands/send-document-for-signature.command';
import { CancelSignatureCommand } from '../../domain/commands/cancel-signature.command';
import { CheckSignatureStatusQuery } from '../../domain/queries/check-signature-status.query';

@ApiTags('Signatures')
@Controller('signatures')
export class SignatureController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a document for digital signature' })
  @ApiResponse({ status: 201, description: 'Document sent successfully.' })
  async sendDocument(@Body() dto: SendDocumentDto) {
    const command = new SendDocumentForSignatureCommand(
      dto.documentId,
      dto.fileUrl,
      dto.signerName,
      dto.signerEmail,
      dto.provider,
    );
    return this.commandBus.execute(command);
  }

  @Get('status/:signatureId')
  @ApiOperation({ summary: 'Check status of a signature' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully.' })
  async checkStatus(
    @Param('signatureId') signatureId: string,
    @Query('provider') provider: string = 'docusign',
  ) {
    const query = new CheckSignatureStatusQuery(signatureId, provider);
    return this.queryBus.execute(query);
  }

  @Post('cancel/:signatureId')
  @ApiOperation({ summary: 'Cancel a pending signature request' })
  @ApiResponse({ status: 200, description: 'Signature cancelled successfully.' })
  async cancelSignature(
    @Param('signatureId') signatureId: string,
    @Body() dto: CancelSignatureDto,
  ) {
    const command = new CancelSignatureCommand(signatureId, dto.reason, dto.provider || 'docusign');
    return this.commandBus.execute(command);
  }

  @Post('webhook/docusign')
  @ApiOperation({ summary: 'DocuSign webhook for events' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Webhook processed.' })
  async docusignWebhook(@Body() payload: any) {
    // Escuta eventos de documento assinado
    // Pode publicar evento de domínio: this.eventBus.publish(new DocumentSignedEvent(...))
    console.log('[DocuSign Webhook] Event received', payload);
    return { received: true };
  }

  @Post('webhook/clicksign')
  @ApiOperation({ summary: 'Clicksign webhook for events' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Webhook processed.' })
  async clicksignWebhook(@Body() payload: any) {
    console.log('[Clicksign Webhook] Event received', payload);
    return { received: true };
  }
}
