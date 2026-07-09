import { IsString, IsArray, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GenerateApiKeyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsArray()
  scopes: string[];
}

export class InstallPluginDto {
  @ApiProperty()
  @IsString()
  pluginId: string;

  @ApiProperty()
  @IsString()
  version: string;
}

export class UpdateWhiteLabelDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  primaryColor?: string;
}
