export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  costPrice?: number;
}

export interface PosCartItem {
  id: string; // unique local ID for the cart item
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  discount: number; // in monetary value
  total: number;
  costPrice?: number;
}

// V2.2 — Métodos de pagamento expandidos com Mercado Pago e Merkaup
export interface PosPayment {
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'STORE_CREDIT' | 'OTHER' | 'MERCADO_PAGO' | 'MERKAUP' | 'TRANSFER' | 'BOLETO';
  amount: number;
}

export interface PosSale {
  id?: string;
  companyId: string;
  cashierId: string;
  operatorId: string;
  customerId?: string;
  customerName?: string;
  customerDoc?: string;
  customerPhone?: string;
  customerObs?: string;
  items: PosCartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  payments: PosPayment[];
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  nfceStatus?: 'PENDING' | 'ISSUED' | 'ERROR';
  createdAt?: string;
  globalDiscount?: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    reason: string;
    beforeAmount: number;
    afterAmount: number;
  };
}

export interface CashDrawer {
  id: string;
  companyId: string;
  name: string;
  status: 'OPEN' | 'CLOSED';
  operatorId?: string;
  operatorName?: string;
  openedAt?: string;
  closedAt?: string;
  initialBalance: number;
  currentBalance: number;
}

// V2.2 — CashDrawerMovement estendido com campos de sangria
export interface CashDrawerMovement {
  id: string;
  drawerId?: string;
  cashDrawerId?: string;
  type: 'SALE' | 'SUPPLY' | 'WITHDRAWAL' | 'SANGRIA' | 'BLEED' | 'ADJUSTMENT';
  amount: number;
  description: string;
  destination?: string;
  reason?: string;
  observacao?: string;
  performedBy?: string;
  ipAddress?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
  terminal?: string;
  terminalId?: string;
}

export interface PdvDashboardMetrics {
  totalSalesToday: number;
  totalRevenueToday: number;
  activeDrawers: number;
  avgTicket: number;
}

// V2.2 — Resumo financeiro do caixa
export interface DrawerSummary {
  drawer: {
    id: string;
    name: string;
    status: string;
    openedAt?: string;
    currentBalance: number;
  };
  totalVendas: number;
  totalDescontos: number;
  totalAcrescimos: number;
  totalSangrias: number;
  totalSuprimentos: number;
  totalCustoVendas: number;
  grossProfit: number;
  salesCount: number;
  avgTicket: number;
  maiorVenda: number;
  menorVenda: number;
  saldoAtual: number;
  paymentBreakdown: Record<string, number>;
  paymentStats: { method: string, amount: number, count: number }[];
  sangrias: CashDrawerMovement[];
  movements: CashDrawerMovement[];
}

// V2.2 — Resposta do listWithdrawals
export interface WithdrawalsResponse {
  items: CashDrawerMovement[];
  total: number;
  count: number;
}

// V2.2 — Payload para criar sangria
export interface SangriaPayload {
  type: 'SANGRIA';
  amount: number;
  description: string;
  destination: string;
  reason: string;
  observacao?: string;
}
