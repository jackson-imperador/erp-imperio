import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CancelSaleOrderDto {
  @ApiPropertyOptional({ description: "Reason for cancellation" })
  @IsString()
  @IsOptional()
  reason?: string;
}
