import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateFiscalProfileDto {
  @ApiProperty()
  @IsString()
  tradeName: string;
}
