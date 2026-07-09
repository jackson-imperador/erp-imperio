import { IsString, IsArray, IsOptional, IsObject } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateWorkflowDefinitionDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  entityType: string;

  @ApiProperty()
  @IsString()
  triggerType: string;

  @ApiProperty()
  @IsArray()
  steps: any[];
}

export class CreateBusinessRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  conditionExpression: string;
}

export class StartWorkflowDto {
  @ApiProperty()
  @IsString()
  entityId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ApproveRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
