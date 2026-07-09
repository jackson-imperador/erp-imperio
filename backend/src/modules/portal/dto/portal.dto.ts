import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePortalDto {
  @ApiProperty()
  @IsString()
  name: string;
}
