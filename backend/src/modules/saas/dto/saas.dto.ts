import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateSaasDto {
  @ApiProperty()
  @IsString()
  name: string;
}
