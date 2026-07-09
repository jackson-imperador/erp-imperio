import { IsString, IsBoolean, IsInt, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProvisionRegionDto {
  @ApiProperty()
  @IsString()
  regionCode: string;

  @ApiProperty()
  @IsBoolean()
  isPrimary: boolean;
}

export class ConfigureCountryDto {
  @ApiProperty()
  @IsString()
  countryCode: string;

  @ApiProperty()
  @IsString()
  currencyCode: string;

  @ApiProperty()
  @IsString()
  timezone: string;
}

export class RegisterKmsDto {
  @ApiProperty()
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  keyAlias: string;

  @ApiProperty()
  @IsString()
  encryptedSecret: string;
}
