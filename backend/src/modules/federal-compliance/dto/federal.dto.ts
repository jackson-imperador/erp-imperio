import { IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GenerateEsocialEventDto {
  @ApiProperty()
  @IsString()
  eventType: string; // e.g. 'S-1000'
}

export class GenerateReinfEventDto {
  @ApiProperty()
  @IsString()
  eventType: string; // e.g. 'R-1000'
}

export class CloseDctfWebDto {
  @ApiProperty()
  @IsString()
  period: string; // e.g. '2023-10'
}
