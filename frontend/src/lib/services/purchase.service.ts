import { api } from '@/lib/axios';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  PurchaseEvent,
  PurchaseFilters,
  PurchaseQuotation,
  ReceiveItemDto,
} from '@/types/purchases';

const BASE = '/purchasing/orders';

export const purchaseService = {
  async list(companyId: string, filters?: PurchaseFilters): Promise<PurchaseOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.supplierId) params.append('supplierId', filters.supplierId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);
      const { data } = await api.get(`/companies/${companyId}${BASE}`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getById(companyId: string, id: string): Promise<PurchaseOrder | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/${id}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async create(companyId: string, dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}`, dto);
    return data.data || data;
  },

  async update(companyId: string, id: string, dto: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> {
    const { data } = await api.put(`/companies/${companyId}${BASE}/${id}`, dto);
    return data.data || data;
  },

  async cancel(companyId: string, id: string, reason: string): Promise<PurchaseOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/cancel`, { reason });
    return data.data || data;
  },

  async approve(companyId: string, id: string): Promise<PurchaseOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/approve`);
    return data.data || data;
  },

  async receivePartial(companyId: string, id: string, items: ReceiveItemDto[]): Promise<PurchaseOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/receive-partial`, { items });
    return data.data || data;
  },

  async receiveAll(companyId: string, id: string): Promise<PurchaseOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/receive-all`);
    return data.data || data;
  },

  async getTimeline(companyId: string, id: string): Promise<PurchaseEvent[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/${id}/events`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getQuotations(companyId: string, id: string): Promise<PurchaseQuotation[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/${id}/quotations`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async exportPdf(companyId: string, id: string): Promise<Blob> {
    const { data } = await api.get(`/companies/${companyId}${BASE}/${id}/export/pdf`, { responseType: 'blob' });
    return data;
  },

  async exportExcel(companyId: string, filters?: PurchaseFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const { data } = await api.get(`/purchasing/export/excel`, { params, responseType: 'blob' });
    return data;
  },
};
