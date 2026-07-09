import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAiDto {
  @ApiProperty()
  @IsString()
  name: string;
}
