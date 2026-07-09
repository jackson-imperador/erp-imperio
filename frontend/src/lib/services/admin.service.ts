import { api } from '@/lib/axios';
import { ApiKey, Webhook, AuditLog, SystemHealth, LicenseInfo, AdminDashboardMetrics, AdminFilters } from '@/types/admin';

const BASE = '/admin';

export const adminService = {
  async getDashboard(companyId: string): Promise<AdminDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getHealth(): Promise<SystemHealth | null> {
    try {
      const { data } = await api.get('/health');
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getLicense(companyId: string): Promise<LicenseInfo | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/license`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listApiKeys(companyId: string): Promise<ApiKey[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/apikeys`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async createApiKey(companyId: string, payload: Partial<ApiKey>): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/apikeys`, payload);
  },

  async revokeApiKey(companyId: string, id: string): Promise<void> {
    await api.delete(`/companies/${companyId}${BASE}/apikeys/${id}`);
  },

  async listWebhooks(companyId: string): Promise<Webhook[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/webhooks`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listAuditLogs(companyId: string, filters?: AdminFilters): Promise<AuditLog[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.module) params.append('module', filters.module);
      
      const { data } = await api.get(`/companies/${companyId}${BASE}/audit`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },
};
