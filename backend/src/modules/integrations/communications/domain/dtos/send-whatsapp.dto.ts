import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WhatsAppProviderType {
  META = 'meta',
  EVOLUTION = 'evolution',
}

export class SendWhatsAppDto {
  @ApiProperty({ example: '+5511999999999' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Hello via WhatsApp!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: WhatsAppProviderType, required: false })
  @IsEnum(WhatsAppProviderType)
  @IsOptional()
  provider?: WhatsAppProviderType;
}
