import { IsEnum, IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingProviderType } from '../enums/shipping-provider-type.enum';

export class CalculateFreightDto {
  @ApiProperty({ enum: ShippingProviderType })
  @IsEnum(ShippingProviderType)
  provider: ShippingProviderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originZipCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  destinationZipCode: string;

  @ApiProperty()
  @IsNumber()
  weight: number;
}

export class GenerateShippingLabelDto {
  @ApiProperty({ enum: ShippingProviderType })
  @IsEnum(ShippingProviderType)
  provider: ShippingProviderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipientName: string;
}

export class TrackShipmentDto {
  @ApiProperty({ enum: ShippingProviderType })
  @IsEnum(ShippingProviderType)
  provider: ShippingProviderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trackingCode: string;
}
