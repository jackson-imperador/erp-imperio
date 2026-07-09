import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IssueNfseDto {
  @ApiProperty()
  @IsString()
  serviceOrderId: string;
}

export class CancelNfseDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
