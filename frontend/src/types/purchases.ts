export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'QUOTATION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ORDERED'
  | 'PARTIAL_RECEIVED'
  | 'RECEIVED'
  | 'INVOICED'
  | 'CANCELLED'
  | 'RETURNED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  discount: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  receivedAt?: string;
  cancelledAt?: string;
  deletedAt?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
    unitCost: number;
    discount?: number;
  }[];
  notes?: string;
  paymentTerms?: string;
  expectedDeliveryDate?: string;
  shippingCost?: number;
}

export interface ReceiveItemDto {
  itemId: string;
  receivedQuantity: number;
  notes?: string;
}

export interface PurchaseEvent {
  id: string;
  orderId: string;
  type: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PurchaseQuotation {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; unitCost: number; leadTimeDays: number }[];
  total: number;
  validUntil: string;
  createdAt: string;
}

export interface PurchaseFilters {
  status?: PurchaseOrderStatus;
  supplierId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
