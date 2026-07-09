import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  FiscalDocumentType,
  FiscalEnvironment,
  FiscalProviderType,
} from "../enums/fiscal.enum";

export class EmitFiscalDocDto {
  @ApiProperty({ enum: FiscalDocumentType })
  @IsEnum(FiscalDocumentType)
  @IsNotEmpty()
  documentType: FiscalDocumentType;

  @ApiProperty({ enum: FiscalProviderType, required: false })
  @IsEnum(FiscalProviderType)
  @IsOptional()
  provider?: FiscalProviderType;

  @ApiProperty({ enum: FiscalEnvironment })
  @IsEnum(FiscalEnvironment)
  @IsNotEmpty()
  environment: FiscalEnvironment;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  payload: Record<string, any>;
}

export class CancelFiscalDocDto {
  @ApiProperty({ enum: FiscalDocumentType })
  @IsEnum(FiscalDocumentType)
  @IsNotEmpty()
  documentType: FiscalDocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  justification: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
