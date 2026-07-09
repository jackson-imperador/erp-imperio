import { api } from '@/lib/axios';
import {
  FiscalDocument,
  FiscalDashboardMetrics,
  FiscalFilters,
  DigitalCertificate,
  SpedReport,
  FiscalEvent,
  SefazLot,
  FiscalDocumentType,
} from '@/types/fiscal';

const BASE = '/fiscal';

export const fiscalService = {
  async getDashboard(companyId: string): Promise<FiscalDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listDocuments(companyId: string, filters?: FiscalFilters): Promise<FiscalDocument[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);
      
      const { data } = await api.get(`/companies/${companyId}${BASE}/documents`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getDocumentById(companyId: string, id: string): Promise<FiscalDocument | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/documents/${id}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async transmitDocument(companyId: string, id: string): Promise<FiscalDocument> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/documents/${id}/transmit`);
    return data.data || data;
  },

  async cancelDocument(companyId: string, id: string, reason: string): Promise<FiscalDocument> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/documents/${id}/cancel`, { reason });
    return data.data || data;
  },

  async issueCce(companyId: string, id: string, correction: string): Promise<FiscalDocument> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/documents/${id}/cce`, { correction });
    return data.data || data;
  },

  async getEvents(companyId: string, documentId: string): Promise<FiscalEvent[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/documents/${documentId}/events`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listCertificates(companyId: string): Promise<DigitalCertificate[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/certificates`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listSpedReports(companyId: string, type?: 'FISCAL' | 'CONTRIBUICOES'): Promise<SpedReport[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      const { data } = await api.get(`/companies/${companyId}${BASE}/sped`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listLots(companyId: string): Promise<SefazLot[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/lots`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async downloadXml(companyId: string, id: string): Promise<Blob> {
    const { data } = await api.get(`/companies/${companyId}${BASE}/documents/${id}/xml`, { responseType: 'blob' });
    return data;
  },

  async downloadDanfe(companyId: string, id: string): Promise<Blob> {
    const { data } = await api.get(`/companies/${companyId}${BASE}/documents/${id}/danfe`, { responseType: 'blob' });
    return data;
  }
};
