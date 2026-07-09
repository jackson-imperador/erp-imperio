import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/services/analytics.service';
import { BiFilters } from '@/types/bi';
import { useAuthStore } from '@/store/authStore';

const QK_EXEC = 'bi-exec';
const QK_FIN = 'bi-fin';
const QK_SALES = 'bi-sales';
const QK_INV = 'bi-inv';
const QK_FISC = 'bi-fisc';
const QK_PRED = 'bi-predictions';
const QK_KPIS = 'bi-kpis';

export function useExecutiveDashboard(filters?: BiFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_EXEC, companyId, filters],
    queryFn: () => analyticsService.getExecutiveDashboard(companyId, filters),
    enabled: !!companyId,
  });
}

export function useFinancialDashboard(filters?: BiFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_FIN, companyId, filters],
    queryFn: () => analyticsService.getFinancialDashboard(companyId, filters),
    enabled: !!companyId,
  });
}

export function useSalesDashboard(filters?: BiFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_SALES, companyId, filters],
    queryFn: () => analyticsService.getSalesDashboard(companyId, filters),
    enabled: !!companyId,
  });
}

export function useInventoryDashboard(filters?: BiFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_INV, companyId, filters],
    queryFn: () => analyticsService.getInventoryDashboard(companyId, filters),
    enabled: !!companyId,
  });
}

export function useFiscalDashboard(filters?: BiFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_FISC, companyId, filters],
    queryFn: () => analyticsService.getFiscalDashboard(companyId, filters),
    enabled: !!companyId,
  });
}

export function usePredictions() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PRED, companyId],
    queryFn: () => analyticsService.getPredictions(companyId),
    enabled: !!companyId,
  });
}

export function useKpis(category?: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_KPIS, companyId, category],
    queryFn: () => analyticsService.getKpis(companyId, category),
    enabled: !!companyId,
  });
}
