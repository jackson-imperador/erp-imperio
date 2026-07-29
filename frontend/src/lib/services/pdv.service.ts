import { api } from '@/lib/axios';
import { PosProduct, PosSale, CashDrawer, CashDrawerMovement, PdvDashboardMetrics, DrawerSummary, WithdrawalsResponse, SangriaPayload } from '@/types/pdv';

const BASE = '/pdv';

export const pdvService = {
  async getDashboard(companyId: string): Promise<PdvDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async searchProducts(companyId: string, query: string): Promise<PosProduct[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/products/search`, { params: { query } });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getProductByBarcode(companyId: string, barcode: string): Promise<PosProduct | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/products/barcode/${barcode}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listCashDrawers(companyId: string): Promise<CashDrawer[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/drawers`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async createDrawer(companyId: string, payload: Partial<CashDrawer>): Promise<{ id: string }> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/drawers`, payload);
    return data.data || data;
  },

  async openDrawer(companyId: string, drawerId: string, initialBalance: number): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/drawers/${drawerId}/open`, { initialBalance });
  },

  async closeDrawer(companyId: string, drawerId: string, finalBalance: number): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/drawers/${drawerId}/close`, { finalBalance });
  },

  async processSale(companyId: string, sale: Omit<PosSale, 'id' | 'createdAt' | 'companyId'>): Promise<{ id: string }> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/sales`, sale);
    return data.data || data;
  },

  async listMovements(companyId: string, drawerId: string): Promise<CashDrawerMovement[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/drawers/${drawerId}/movements`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async createMovement(companyId: string, drawerId: string, payload: { type: string, amount: number, description: string, destination?: string, reason?: string, observacao?: string }): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/drawers/${drawerId}/movements`, payload);
  },

  // V2.2 — Criar Sangria com campos completos de auditoria
  async createSangria(companyId: string, drawerId: string, payload: SangriaPayload): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/drawers/${drawerId}/movements`, payload);
  },

  // V2.2 — Resumo financeiro completo do caixa
  async getDrawerSummary(companyId: string, drawerId: string): Promise<DrawerSummary | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/drawers/${drawerId}/summary`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  // V2.2 — Listar sangrias para módulo Financeiro
  async listWithdrawals(companyId: string, filters?: {
    drawerId?: string;
    startDate?: string;
    endDate?: string;
    performedBy?: string;
    destination?: string;
  }): Promise<WithdrawalsResponse> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/withdrawals`, { params: filters });
      return data.data || data || { items: [], total: 0, count: 0 };
    } catch {
      return { items: [], total: 0, count: 0 };
    }
  },
};
