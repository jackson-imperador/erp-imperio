import { IsString, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum SpedTypeEnum {
  FISCAL = "FISCAL",
  CONTRIBUTION = "CONTRIBUTION",
}

export class GenerateSpedDto {
  @ApiProperty({ enum: SpedTypeEnum })
  @IsEnum(SpedTypeEnum)
  spedType: SpedTypeEnum;

  @ApiProperty()
  @IsString()
  layoutVersion: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}
