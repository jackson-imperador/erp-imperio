import { IsNumber, IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProcessPaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expirationMonth: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  expirationYear: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cvv: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  gatewayName?: string;
}
