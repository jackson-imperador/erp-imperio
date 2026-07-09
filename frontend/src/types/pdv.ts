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
}

export interface PosPayment {
  method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'STORE_CREDIT' | 'OTHER';
  amount: number;
}

export interface PosSale {
  id?: string;
  companyId: string;
  cashierId: string;
  operatorId: string;
  customerId?: string;
  customerName?: string;
  items: PosCartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  payments: PosPayment[];
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  nfceStatus?: 'PENDING' | 'ISSUED' | 'ERROR';
  createdAt?: string;
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

export interface CashDrawerMovement {
  id: string;
  drawerId: string;
  type: 'SALE' | 'SUPPLY' | 'BLEED' | 'ADJUSTMENT'; // Suprimento, Sangria
  amount: number;
  description: string;
  createdAt: string;
}

export interface PdvDashboardMetrics {
  totalSalesToday: number;
  totalRevenueToday: number;
  activeDrawers: number;
  avgTicket: number;
}
