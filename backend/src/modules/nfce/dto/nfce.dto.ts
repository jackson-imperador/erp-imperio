import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IssueNfceDto {
  @ApiProperty()
  @IsString()
  saleOrderId: string;
}

export class CancelNfceDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
