import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBiDto {
  @ApiProperty()
  @IsString()
  name: string;
}
