import { IsString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GeneratePixChargeDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  payerDocument: string;
}

export class GenerateBoletoDto {
  @ApiProperty()
  @IsNumber()
  amount: number;
}
