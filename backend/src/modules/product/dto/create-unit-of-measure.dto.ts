import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUnitOfMeasureDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  abbreviation: string;
}
