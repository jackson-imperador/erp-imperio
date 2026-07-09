import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDataSubjectRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requesterName: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  requesterEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestType: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  details?: string;
}

export class RegisterConsentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty()
  @IsBoolean()
  granted: boolean;
}
