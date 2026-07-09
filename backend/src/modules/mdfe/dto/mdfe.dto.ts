import { IsString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class IssueMdfeDto {
  @ApiProperty()
  @IsArray()
  documentAccessKeys: string[]; // NFe/CTe/NFCe keys
}

export class CloseMdfeDto {
  @ApiProperty()
  @IsString()
  ufEnd: string;
}
