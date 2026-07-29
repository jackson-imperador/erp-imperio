// ===================================================================
// Sales Types — Domain DTOs for the Sales Module
// ===================================================================

export type OrderStatus =
  | 'DRAFT'
  | 'QUOTE'
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'INVOICED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface SaleOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  companyId: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  items: SaleOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  cancelledAt?: string;
  deletedAt?: string;
}

export interface CreateSaleOrderDto {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  notes?: string;
  paymentMethod?: string;
}

export interface SaleEvent {
  id: string;
  orderId: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SalesFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  perPage?: number;
}
