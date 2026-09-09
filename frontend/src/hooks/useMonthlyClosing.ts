import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface MonthlyClosingData {
  id?: string;
  month: number;
  year: number;
  status?: string;
  // Faturamento
  grossRevenue: number;
  discounts: number;
  cancellations: number;
  returns: number;
  netRevenue: number;
  salesCount: number;
  averageTicket: number;
  // CMV
  cogs: number;
  cogsIncomplete: number;
  cogsReliability: string;
  grossProfit: number;
  // Resultado
  expensesPaid: number;
  expensesPending: number;
  otherIncomes: number;
  otherExpenses: number;
  netIncome: number;
  isPositive?: boolean;
  // Caixa
  cashInitial: number;
  cashInflows: number;
  cashOutflows: number;
  cashFinal: number;
  salesReceived: number;
  salesPending: number;
  // Estoque
  stockInitial: number;
  stockPurchases: number;
  stockFinal: number;
  productsSold: number;
  // Snapshots
  commissionData?: {
    sellerId: string;
    sellerName: string;
    grossSales: number;
    discounts: number;
    cancellations: number;
    netSales: number;
    commissionBase: number;
    commissionRate: number;
    commissionValue: number;
  }[];
  topProducts?: {
    productId: string;
    name: string;
    qtySold: number;
    revenue: number;
    cogs: number;
    margin: number;
  }[];
  paymentForms?: {
    method: string;
    amount: number;
  }[];
  cashCounted?: number;
  cashDifference?: number;
  closedAt?: string;
  closedBy?: string;
}

export function useMonthlyClosingPreview(month: number, year: number) {
  return useQuery<MonthlyClosingData>({
    queryKey: ["monthly-closing-preview", month, year],
    queryFn: async () => {
      const { data } = await api.get(
        `/monthly-closing/${year}/${month}/preview`
      );
      return data;
    },
    enabled: month >= 1 && month <= 12 && year >= 2000,
    retry: 1, // Don't retry much for preview
  });
}

export function useMonthlyClosingHistory() {
  return useQuery<MonthlyClosingData[]>({
    queryKey: ["monthly-closing-history"],
    queryFn: async () => {
      const { data } = await api.get("/monthly-closing");
      return data;
    },
  });
}

export function useCloseMonth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, year, cashCounted }: { month: number; year: number; cashCounted?: number }) => {
      const { data } = await api.post(
        `/monthly-closing/${year}/${month}/close`,
        { cashCounted }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-closing-history"] });
      qc.invalidateQueries({ queryKey: ["monthly-closing-preview"] });
    },
  });
}

export function useReopenMonth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      month,
      year,
      reason,
    }: {
      month: number;
      year: number;
      reason: string;
    }) => {
      const { data } = await api.post(
        `/monthly-closing/${year}/${month}/reopen`,
        { reason }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-closing-history"] });
      qc.invalidateQueries({ queryKey: ["monthly-closing-preview"] });
    },
  });
}

export function useUpdateMonthlyClosingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.put("/monthly-closing/settings", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["monthly-closing-preview"] });
    },
  });
}
