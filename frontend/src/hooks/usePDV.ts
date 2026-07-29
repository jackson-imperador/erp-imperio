'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { pdvService } from '@/lib/services/pdv.service';
import { PosSale, SangriaPayload } from '@/types/pdv';
import { useAuthStore } from '@/store/authStore';

export const QK_PDV_DASH = 'pdv-dashboard';
export const QK_PDV_DRAWERS = 'pdv-drawers';
export const QK_PDV_MOVEMENTS = 'pdv-movements';
export const QK_PDV_SEARCH = 'pdv-search';
export const QK_PDV_SUMMARY = 'pdv-summary';       // V2.2
export const QK_PDV_WITHDRAWALS = 'pdv-withdrawals'; // V2.2

// V2.2 — Helper para invalidar TODOS os módulos relacionados
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [QK_PDV_DASH] });
    queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
    queryClient.invalidateQueries({ queryKey: [QK_PDV_MOVEMENTS] });
    queryClient.invalidateQueries({ queryKey: [QK_PDV_SUMMARY] });
    queryClient.invalidateQueries({ queryKey: [QK_PDV_WITHDRAWALS] });
    queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    queryClient.invalidateQueries({ queryKey: ['bi-inv'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
    queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['cash-flow'] });
  };
}

export function usePdvDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_DASH, companyId],
    queryFn: () => pdvService.getDashboard(companyId),
    enabled: !!companyId,
    refetchInterval: 30000, // V2.2 — atualiza a cada 30s
  });
}

export function useProductSearch(query: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_SEARCH, companyId, query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const { data } = await api.get(`/companies/${companyId}/pdv/products/search`, {
        params: { query },
      });
      return data.data || data;
    },
    enabled: !!companyId && query.length > 2,
  });
}

export function useCashDrawers() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_DRAWERS, companyId],
    queryFn: () => pdvService.listCashDrawers(companyId),
    enabled: !!companyId,
    refetchInterval: 15000, // V2.2 — atualiza a cada 15s
  });
}

export function useDrawerMovements(drawerId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_MOVEMENTS, companyId, drawerId],
    queryFn: () => pdvService.listMovements(companyId, drawerId),
    enabled: !!companyId && !!drawerId,
    refetchInterval: 10000, // V2.2 — atualiza a cada 10s
  });
}

// V2.2 — Hook para resumo financeiro do caixa
export function useDrawerSummary(drawerId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_SUMMARY, companyId, drawerId],
    queryFn: () => pdvService.getDrawerSummary(companyId, drawerId),
    enabled: !!companyId && !!drawerId,
    refetchInterval: 10000, // atualiza a cada 10s
  });
}

// V2.2 — Hook para listar sangrias no Financeiro
export function useWithdrawals(filters?: {
  drawerId?: string;
  startDate?: string;
  endDate?: string;
  performedBy?: string;
  destination?: string;
}) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_WITHDRAWALS, companyId, filters],
    queryFn: () => pdvService.listWithdrawals(companyId, filters),
    enabled: !!companyId,
  });
}

export function usePdvMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  const invalidateAll = useInvalidateAll();

  const openDrawer = useMutation({
    mutationFn: ({ drawerId, amount }: { drawerId: string, amount: number }) =>
      pdvService.openDrawer(companyId, drawerId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DASH] });
    },
  });

  const closeDrawer = useMutation({
    mutationFn: ({ drawerId, amount }: { drawerId: string, amount: number }) =>
      pdvService.closeDrawer(companyId, drawerId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DASH] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_SUMMARY] });
    },
  });

  const createDrawer = useMutation({
    mutationFn: (payload: any) => pdvService.createDrawer(companyId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] }),
  });

  const processSale = useMutation({
    mutationFn: (sale: Omit<PosSale, 'id' | 'createdAt' | 'companyId'>) =>
      pdvService.processSale(companyId, sale),
    onSuccess: () => {
      // V2.2 — Invalida TODOS os módulos após venda
      invalidateAll();
    },
  });

  const createMovement = useMutation({
    mutationFn: ({ drawerId, payload }: {
      drawerId: string,
      payload: { type: string, amount: number, description: string, destination?: string, reason?: string, observacao?: string }
    }) => pdvService.createMovement(companyId, drawerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QK_PDV_MOVEMENTS, companyId, variables.drawerId] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_SUMMARY, companyId, variables.drawerId] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_WITHDRAWALS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DASH] });
    },
  });

  // V2.2 — Mutation específica para Sangria
  const createSangria = useMutation({
    mutationFn: ({ drawerId, payload }: { drawerId: string, payload: SangriaPayload }) =>
      pdvService.createSangria(companyId, drawerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QK_PDV_MOVEMENTS, companyId, variables.drawerId] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_SUMMARY, companyId, variables.drawerId] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_WITHDRAWALS] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DASH] });
    },
  });

  return {
    openDrawer,
    closeDrawer,
    createDrawer,
    processSale,
    createMovement,
    createSangria,     // V2.2
    invalidateAll,     // V2.2 — exposta para uso no botão "Voltar ao ERP"
  };
}
