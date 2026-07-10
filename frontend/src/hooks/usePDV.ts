import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pdvService } from '@/lib/services/pdv.service';
import { PosSale } from '@/types/pdv';
import { useAuthStore } from '@/store/authStore';

const QK_PDV_DASH = 'pdv-dashboard';
const QK_PDV_DRAWERS = 'pdv-drawers';
const QK_PDV_MOVEMENTS = 'pdv-movements';
const QK_PDV_SEARCH = 'pdv-search';

export function usePdvDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_DASH, companyId],
    queryFn: () => pdvService.getDashboard(companyId),
    enabled: !!companyId,
  });
}

export function useProductSearch(query: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_SEARCH, companyId, query],
    queryFn: () => pdvService.searchProducts(companyId, query),
    enabled: !!companyId && query.length > 2,
  });
}

export function useCashDrawers() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_DRAWERS, companyId],
    queryFn: () => pdvService.listCashDrawers(companyId),
    enabled: !!companyId,
  });
}

export function useDrawerMovements(drawerId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PDV_MOVEMENTS, companyId, drawerId],
    queryFn: () => pdvService.listMovements(companyId, drawerId),
    enabled: !!companyId && !!drawerId,
  });
}

export function usePdvMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');

  const openDrawer = useMutation({
    mutationFn: ({ drawerId, amount }: { drawerId: string, amount: number }) => pdvService.openDrawer(companyId, drawerId, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] }),
  });

  const closeDrawer = useMutation({
    mutationFn: ({ drawerId, amount }: { drawerId: string, amount: number }) => pdvService.closeDrawer(companyId, drawerId, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] }),
  });

  const createDrawer = useMutation({
    mutationFn: (payload: any) => pdvService.createDrawer(companyId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] }),
  });

  const processSale = useMutation({
    mutationFn: (sale: Omit<PosSale, 'id' | 'createdAt' | 'companyId'>) => pdvService.processSale(companyId, { ...sale, companyId }),
  });

  const createMovement = useMutation({
    mutationFn: ({ drawerId, payload }: { drawerId: string, payload: { type: string, amount: number, description: string } }) => pdvService.createMovement(companyId, drawerId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QK_PDV_MOVEMENTS, companyId, variables.drawerId] });
      queryClient.invalidateQueries({ queryKey: [QK_PDV_DRAWERS] });
    }
  });

  return {
    openDrawer,
    closeDrawer,
    createDrawer,
    processSale,
    createMovement,
  };
}
