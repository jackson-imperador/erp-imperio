import { api } from '@/lib/axios';
import {
  Employee,
  Department,
  Position,
  Vacation,
  Leave,
  PayrollProcessing,
  HrDashboardMetrics,
  HrFilters,
  EsocialEvent
} from '@/types/hr';

const BASE = '/hr';

export const hrService = {
  async getDashboard(companyId: string): Promise<HrDashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listEmployees(companyId: string, filters?: HrFilters): Promise<Employee[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.departmentId) params.append('departmentId', filters.departmentId);
      if (filters?.positionId) params.append('positionId', filters.positionId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const { data } = await api.get(`/companies/${companyId}${BASE}/employees`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async getEmployee(companyId: string, employeeId: string): Promise<Employee | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/employees/${employeeId}`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listDepartments(companyId: string): Promise<Department[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/departments`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listPositions(companyId: string): Promise<Position[]> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/positions`);
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listVacations(companyId: string, filters?: HrFilters): Promise<Vacation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      const { data } = await api.get(`/companies/${companyId}${BASE}/vacations`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listLeaves(companyId: string, filters?: HrFilters): Promise<Leave[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const { data } = await api.get(`/companies/${companyId}${BASE}/leaves`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listPayrolls(companyId: string, year?: number): Promise<PayrollProcessing[]> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      const { data } = await api.get(`/companies/${companyId}${BASE}/payroll`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async listEsocialEvents(companyId: string, filters?: HrFilters): Promise<EsocialEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const { data } = await api.get(`/companies/${companyId}${BASE}/esocial/events`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async calculatePayroll(companyId: string, month: number, year: number): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/payroll/calculate`, { month, year });
  },

  async syncEsocial(companyId: string): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/esocial/sync`);
  },
};
