import { api } from '@/lib/axios';
import { BiDashboardMetrics, BiFilters, AnalyticsPrediction, KPI } from '@/types/bi';

const BASE = '/bi';

export const analyticsService = {
  async getExecutiveDashboard(companyId: string, filters?: BiFilters): Promise<BiDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/executive`, { params: filters });
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getFinancialDashboard(companyId: string, filters?: BiFilters): Promise<BiDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/financial`, { params: filters });
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getSalesDashboard(companyId: string, filters?: BiFilters): Promise<BiDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/sales`, { params: filters });
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getInventoryDashboard(companyId: string, filters?: BiFilters): Promise<BiDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/inventory`, { params: filters });
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getFiscalDashboard(companyId: string, filters?: BiFilters): Promise<BiDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/fiscal`, { params: filters });
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getPredictions(companyId: string): Promise<AnalyticsPrediction[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/predictions`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getKpis(companyId: string, category?: string): Promise<KPI[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/kpis`, { params: { category } });
      return data.data || data || [];
    } catch {
      return [];
    }
  }
};
