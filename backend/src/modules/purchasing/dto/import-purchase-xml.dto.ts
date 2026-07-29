import { IsString, IsNumber, IsBoolean, IsArray, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class XmlProductItemDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  costPrice: number;

  @ApiProperty()
  @IsNumber()
  salePrice: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;
}

export class ImportPurchaseXmlDto {
  @ApiProperty({ type: [XmlProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XmlProductItemDto)
  products: XmlProductItemDto[];

  @ApiProperty()
  @IsBoolean()
  isCashPayment: boolean;

  @ApiProperty()
  @IsString()
  fileName: string;
}
