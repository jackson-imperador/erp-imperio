import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BankProvider } from "../enums/banking.enums";

export class GenerateBoletoDto {
  @ApiProperty({ enum: BankProvider })
  @IsEnum(BankProvider)
  provider: BankProvider;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  dueDate: string;

  @ApiProperty()
  @IsString()
  payerName: string;

  @ApiProperty()
  @IsString()
  payerDocument: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}

export class ProcessPixDto {
  @ApiProperty({ enum: BankProvider })
  @IsEnum(BankProvider)
  provider: BankProvider;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  txid: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tenantId?: string;
}
