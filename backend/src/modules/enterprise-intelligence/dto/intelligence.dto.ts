import { IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum DashboardType {
  CEO = "CEO",
  CFO = "CFO",
  COO = "COO",
  SALES = "SALES",
}

export class RunEtlDto {
  @ApiProperty()
  @IsString()
  sourceDomain: string;
}

export class GeneratePredictionDto {
  @ApiProperty()
  @IsString()
  modelName: string;

  @ApiProperty()
  @IsString()
  entityId: string;
}

export class GetDashboardDto {
  @ApiProperty({ enum: DashboardType })
  @IsEnum(DashboardType)
  dashboardType: DashboardType;
}
