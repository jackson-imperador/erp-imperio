import { IsInt, Min, Max } from 'class-validator';

export class GetClosingDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;
}

export class CloseMonthDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;
}

export class ReopenMonthDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  reason: string;
}

export interface CommissionEntry {
  sellerId: string;
  sellerName: string;
  grossSales: number;
  discounts: number;
  cancellations: number;
  netSales: number;
  commissionBase: number;
  commissionRate: number;
  commissionValue: number;
}

export interface TopProductEntry {
  productId: string;
  name: string;
  qtySold: number;
  revenue: number;
  cogs: number;
  margin: number;
}
