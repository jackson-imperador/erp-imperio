import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EmailProviderType {
  SENDGRID = 'sendgrid',
  SES = 'ses',
  RESEND = 'resend',
}

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ example: 'Welcome to ERP Imperio' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<h1>Hello</h1>' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isHtml?: boolean;

  @ApiProperty({ enum: EmailProviderType, required: false })
  @IsEnum(EmailProviderType)
  @IsOptional()
  provider?: EmailProviderType;
}
