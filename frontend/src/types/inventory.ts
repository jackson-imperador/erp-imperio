export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'INITIAL';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';

export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockLocation {
  id: string;
  warehouseId: string;
  warehouseName?: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string; // Product ID usually
  companyId: string;
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  averageCost: number;
  totalValue: number;
  status: StockStatus;
  warehouseId: string;
  warehouseName?: string;
  locationId?: string;
  locationCode?: string;
}

export interface StockMovement {
  id: string;
  companyId: string;
  productId: string;
  productName?: string;
  warehouseId: string;
  warehouseName?: string;
  type: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  documentId?: string; // NFe, Pedido, etc.
  documentType?: string;
  observation?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

export interface InventoryLot {
  id: string;
  productId: string;
  productName?: string;
  lotNumber: string;
  manufactureDate?: string;
  expirationDate: string;
  initialQuantity: number;
  currentQuantity: number;
  warehouseId: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'QUARANTINE';
  createdAt: string;
}

export interface TransferRequest {
  originWarehouseId: string;
  destinationWarehouseId: string;
  productId: string;
  quantity: number;
  observation?: string;
}

export interface AdjustmentRequest {
  warehouseId: string;
  productId: string;
  quantity: number; // positive or negative
  reason: string;
}

export interface InventoryDashboardMetrics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  movementsByDay: { date: string; in: number; out: number }[];
  abcCurve: { product: string; percentage: number; class: 'A' | 'B' | 'C' }[];
}

export interface InventoryFilters {
  warehouseId?: string;
  productId?: string;
  status?: StockStatus;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
