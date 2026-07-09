import { IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IssueCteDto {
  @ApiProperty()
  @IsArray()
  nfeAccessKeys: string[];
}

export class CancelCteDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
