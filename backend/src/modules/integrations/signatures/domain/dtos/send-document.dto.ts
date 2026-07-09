import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class SendDocumentDto {
  @ApiProperty({ description: 'ID of the document in the system' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'File content in base64 or file URL' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ description: 'Name of the signer' })
  @IsString()
  @IsNotEmpty()
  signerName: string;

  @ApiProperty({ description: 'Email of the signer' })
  @IsEmail()
  @IsNotEmpty()
  signerEmail: string;

  @ApiProperty({ description: 'Provider to use (docusign, clicksign)', default: 'docusign' })
  @IsString()
  @IsOptional()
  provider?: string;
}
