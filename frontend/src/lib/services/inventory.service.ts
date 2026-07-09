import { api } from '@/lib/axios';
import {
  InventoryItem,
  StockMovement,
  Warehouse,
  StockLocation,
  InventoryLot,
  InventoryDashboardMetrics,
  InventoryFilters,
  TransferRequest,
  AdjustmentRequest,
} from '@/types/inventory';

const BASE = '/inventory';

export const inventoryService = {
  async getDashboard(companyId: string): Promise<InventoryDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listProducts(companyId: string, filters?: InventoryFilters): Promise<InventoryItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const { data } = await api.get(`/companies/${companyId}${BASE}/products`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getProductStock(companyId: string, productId: string): Promise<InventoryItem | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/products/${productId}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listMovements(companyId: string, filters?: InventoryFilters): Promise<StockMovement[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      
      const { data } = await api.get(`/companies/${companyId}${BASE}/movements`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async executeTransfer(companyId: string, dto: TransferRequest): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/transfers`, dto);
  },

  async executeAdjustment(companyId: string, dto: AdjustmentRequest): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/adjustments`, dto);
  },

  async listLots(companyId: string, productId?: string): Promise<InventoryLot[]> {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      const { data } = await api.get(`/companies/${companyId}${BASE}/lots`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listWarehouses(companyId: string): Promise<Warehouse[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/warehouses`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listLocations(companyId: string, warehouseId?: string): Promise<StockLocation[]> {
    try {
      const params = new URLSearchParams();
      if (warehouseId) params.append('warehouseId', warehouseId);
      const { data } = await api.get(`/companies/${companyId}${BASE}/locations`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },
};
