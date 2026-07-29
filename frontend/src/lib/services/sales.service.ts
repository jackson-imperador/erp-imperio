import { api } from '@/lib/axios';
import { SaleOrder, CreateSaleOrderDto, SaleEvent, SalesFilters } from '@/types/sales';

const BASE = '/sales/orders';

export const salesService = {
  async list(companyId: string, filters?: SalesFilters): Promise<SaleOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.perPage) params.append('perPage', filters.perPage.toString());
      const { data } = await api.get(`/companies/${companyId}${BASE}`, { params });
      let items: any[] = [];
      if (Array.isArray(data)) items = data;
      else if (data?.data && Array.isArray(data.data)) items = data.data;
      else if (data?.data?.data && Array.isArray(data.data.data)) items = data.data.data;
      return items.map((item: any) => {
        let parsedName = item.customer?.name;
        if (!parsedName && item.notes && item.notes.includes('Cliente:')) {
          const match = item.notes.match(/Cliente:\s*([^|]+)/);
          if (match) parsedName = match[1].trim();
        }
        return {
          ...item,
          total: Number(item.totalAmount) || 0,
          discount: Number(item.discountAmount) || 0,
          customerName: parsedName || 'Consumidor Final'
        };
      });
    } catch {
      return [];
    }
  },

  async getById(companyId: string, id: string): Promise<SaleOrder | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/${id}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async create(companyId: string, dto: CreateSaleOrderDto): Promise<SaleOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}`, dto);
    return data.data || data;
  },

  async update(companyId: string, id: string, dto: Partial<CreateSaleOrderDto>): Promise<SaleOrder> {
    const { data } = await api.put(`/companies/${companyId}${BASE}/${id}`, dto);
    return data.data || data;
  },

  async cancel(companyId: string, id: string, reason: string): Promise<SaleOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/cancel`, { reason });
    return data.data || data;
  },

  async approve(companyId: string, id: string): Promise<SaleOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/approve`);
    return data.data || data;
  },

  async convertQuote(companyId: string, id: string): Promise<SaleOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/convert`);
    return data.data || data;
  },

  async checkout(companyId: string, id: string, paymentMethod: string): Promise<SaleOrder> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/${id}/checkout`, { paymentMethod });
    return data.data || data;
  },

  async reserveStock(companyId: string, id: string): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/${id}/reserve-stock`);
  },

  async getTimeline(companyId: string, id: string): Promise<SaleEvent[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/${id}/events`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async exportPdf(companyId: string, id: string): Promise<Blob> {
    const { data } = await api.get(`/companies/${companyId}${BASE}/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return data;
  },

  async exportExcel(companyId: string, filters?: SalesFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    const { data } = await api.get(`/sales/export/excel`, {
      params,
      responseType: 'blob',
    });
    return data;
  },
};
