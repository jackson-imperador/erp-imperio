import { api } from '@/lib/axios';
import {
  FinancialTransaction,
  FinancialFilters,
  DashboardMetrics,
  PixCharge,
  Boleto,
  BankStatement,
  CreateTransactionDto,
  PayTransactionDto,
} from '@/types/financial';

const BASE = '/financial';

export const financialService = {
  async getDashboard(companyId: string): Promise<DashboardMetrics | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/dashboard`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async listTransactions(companyId: string, filters?: FinancialFilters): Promise<FinancialTransaction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.dueDateFrom) params.append('dueDateFrom', filters.dueDateFrom);
      if (filters?.dueDateTo) params.append('dueDateTo', filters.dueDateTo);
      if (filters?.search) params.append('search', filters.search);
      
      const fetchPayables = async () => {
        try {
          const { data } = await api.get(`/companies/${companyId}${BASE}/payables`, { params });
          const items = data?.data?.data || data?.data || [];
          return items.map((t: any) => ({ ...t, type: 'PAYABLE' }));
        } catch { return []; }
      };

      const fetchReceivables = async () => {
        try {
          const { data } = await api.get(`/companies/${companyId}${BASE}/receivables`, { params });
          const items = data?.data?.data || data?.data || [];
          return items.map((t: any) => ({ ...t, type: 'RECEIVABLE' }));
        } catch { return []; }
      };

      if (filters?.type === 'PAYABLE') {
        return await fetchPayables();
      }
      
      if (filters?.type === 'RECEIVABLE') {
        return await fetchReceivables();
      }
      
      // Se o tipo não for especificado (ex: Dashboard, extrato), busca ambos
      const [payables, receivables] = await Promise.all([fetchPayables(), fetchReceivables()]);
      return [...payables, ...receivables].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } catch {
      return [];
    }
  },

  async getTransactionById(companyId: string, id: string): Promise<FinancialTransaction | null> {
    try {
      try {
        const { data } = await api.get(`/companies/${companyId}${BASE}/payables/${id}`);
        if (data && (data.data || data.id)) {
          const item = data.data || data;
          return { ...item, type: 'PAYABLE' };
        }
      } catch (err: any) {
        if (err.response?.status !== 404) throw err;
      }

      try {
        const { data } = await api.get(`/companies/${companyId}${BASE}/receivables/${id}`);
        if (data && (data.data || data.id)) {
          const item = data.data || data;
          return { ...item, type: 'RECEIVABLE' };
        }
      } catch (err: any) {
        if (err.response?.status !== 404) throw err;
      }
      return null;
    } catch {
      return null;
    }
  },

  async createTransaction(companyId: string, dto: CreateTransactionDto): Promise<FinancialTransaction> {
    const { data } = await api.post(`/companies/${companyId}/financial/payables`, dto);
    return data.data || data;
  },

  async updateTransaction(companyId: string, id: string, dto: Partial<CreateTransactionDto>): Promise<FinancialTransaction> {
    const { data } = await api.put(`/companies/${companyId}${BASE}/transactions/${id}`, dto);
    return data.data || data;
  },

  async cancelTransaction(companyId: string, id: string, reason: string): Promise<FinancialTransaction> {
    try {
      const { data } = await api.post(`/companies/${companyId}${BASE}/payables/${id}/cancel`, { reason });
      return data.data || data;
    } catch (err: any) {
      if (err.response?.status !== 404) throw err;
      const { data } = await api.post(`/companies/${companyId}${BASE}/receivables/${id}/cancel`, { reason });
      return data.data || data;
    }
  },

  async payTransaction(companyId: string, id: string, dto: PayTransactionDto): Promise<FinancialTransaction> {
    try {
      const { data } = await api.patch(`/companies/${companyId}${BASE}/payables/${id}/pay`, dto);
      return data.data || data;
    } catch (err: any) {
      if (err.response?.status !== 404) throw err;
      const { data } = await api.patch(`/companies/${companyId}${BASE}/receivables/${id}/pay`, dto);
      return data.data || data;
    }
  },

  async generatePix(companyId: string, transactionId: string): Promise<PixCharge> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/transactions/${transactionId}/pix`);
    return data.data || data;
  },

  async getPix(companyId: string, transactionId: string): Promise<PixCharge | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/transactions/${transactionId}/pix`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async generateBoleto(companyId: string, transactionId: string): Promise<Boleto> {
    const { data } = await api.post(`/companies/${companyId}${BASE}/transactions/${transactionId}/boleto`);
    return data.data || data;
  },

  async getBoleto(companyId: string, transactionId: string): Promise<Boleto | null> {
    try {
      const { data } = await api.get(`/companies/${companyId}${BASE}/transactions/${transactionId}/boleto`);
      return data.data || data;
    } catch {
      return null;
    }
  },

  async getStatements(companyId: string, accountId?: string): Promise<BankStatement[]> {
    try {
      const params = new URLSearchParams();
      if (accountId) params.append('accountId', accountId);
      const { data } = await api.get(`/companies/${companyId}${BASE}/statements`, { params });
      return data.data || data || [];
    } catch {
      return [];
    }
  },

  async reconcileStatement(companyId: string, statementId: string, transactionId: string): Promise<void> {
    await api.post(`/companies/${companyId}${BASE}/statements/${statementId}/reconcile`, { transactionId });
  }
};
