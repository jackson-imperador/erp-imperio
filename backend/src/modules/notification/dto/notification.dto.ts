import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
  IsEmail,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NotificationType, NotificationPriority } from "@prisma/client";

export class SendNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dataJson?: Record<string, any>;
}
