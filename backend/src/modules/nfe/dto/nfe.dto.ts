import { IsString, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IssueNfeDto {
  @ApiProperty()
  @IsString()
  saleOrderId: string;
}

export class CancelNfeDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
