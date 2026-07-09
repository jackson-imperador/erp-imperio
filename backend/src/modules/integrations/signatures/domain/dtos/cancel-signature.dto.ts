import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CancelSignatureDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Provider used (docusign, clicksign)', default: 'docusign' })
  @IsString()
  @IsOptional()
  provider?: string;
}
