import { IsString, IsInt, IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfigureSamlDto {
  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiProperty()
  @IsString()
  ssoUrl: string;

  @ApiProperty()
  @IsString()
  certificate: string;
}

export class CreateTenantBackupDto {
  @ApiProperty()
  @IsString()
  storageUrl: string;

  @ApiProperty()
  @IsInt()
  sizeBytes: number;
}

export class StartCanaryDeployDto {
  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty()
  @IsString()
  version: string;

  @ApiProperty()
  @IsInt()
  trafficPercent: number;
}
