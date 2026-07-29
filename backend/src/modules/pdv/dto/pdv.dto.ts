import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDrawerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  operatorName?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsNumber()
  @IsOptional()
  currentBalance?: number;
}

export class OpenDrawerDto {
  @IsNumber()
  initialBalance: number;
}

export class CloseDrawerDto {
  @IsNumber()
  finalBalance: number;
}

// V2.2 — DrawerMovementDto estendido com campos de sangria e auditoria
export class DrawerMovementDto {
  @IsString()
  @IsNotEmpty()
  type: string; // SUPPLY, WITHDRAWAL, SANGRIA

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  // V2.2 — Campos de Sangria
  @IsString()
  @IsOptional()
  destination?: string; // BANK, SAFE, FINANCIAL, ADMIN, PAYMENTS, TROCO, OTHER

  @IsString()
  @IsOptional()
  reason?: string; // Motivo rápido (selecionado da lista)

  @IsString()
  @IsOptional()
  observacao?: string; // Observação livre

  @IsString()
  @IsOptional()
  ipAddress?: string; // Capturado pelo controller
}

export class PdvSaleItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  discount: number;

  @IsNumber()
  total: number;
}

export class PdvSalePaymentDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsNumber()
  amount: number;
}

export class ProcessPdvSaleDto {
  @IsString()
  @IsNotEmpty()
  cashierId: string;

  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerDoc?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  customerObs?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PdvSaleItemDto)
  items: PdvSaleItemDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  discountTotal: number;

  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PdvSalePaymentDto)
  payments: PdvSalePaymentDto[];

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  globalDiscount?: {
    type: string;
    value: number;
    reason: string;
    beforeAmount: number;
    afterAmount: number;
  };
}
