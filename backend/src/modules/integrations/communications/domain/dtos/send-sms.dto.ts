import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SmsProviderType {
  TWILIO = 'twilio',
  ZENVIA = 'zenvia',
}

export class SendSmsDto {
  @ApiProperty({ example: '+5511999999999' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Your OTP is 123456' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: SmsProviderType, required: false })
  @IsEnum(SmsProviderType)
  @IsOptional()
  provider?: SmsProviderType;
}
