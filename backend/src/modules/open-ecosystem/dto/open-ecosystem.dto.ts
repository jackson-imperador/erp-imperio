import { IsString, IsBoolean, IsArray, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDeveloperDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;
}

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class SubscribeApiDto {
  @ApiProperty()
  @IsString()
  productId: string;
}
