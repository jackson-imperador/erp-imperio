import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/lib/services/inventory.service';
import { InventoryFilters, TransferRequest, AdjustmentRequest } from '@/types/inventory';
import { useAuthStore } from '@/store/authStore';

const QK_DASHBOARD = 'inventory-dashboard';
const QK_PRODUCTS = 'inventory-products';
const QK_MOVEMENTS = 'inventory-movements';
const QK_LOTS = 'inventory-lots';
const QK_WAREHOUSES = 'inventory-warehouses';
const QK_LOCATIONS = 'inventory-locations';

export function useInventoryDashboard() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_DASHBOARD, companyId],
    queryFn: () => inventoryService.getDashboard(companyId),
    enabled: !!companyId,
  });
}

export function useInventory(filters?: InventoryFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PRODUCTS, companyId, filters],
    queryFn: () => inventoryService.listProducts(companyId, filters),
    enabled: !!companyId,
  });
}

export function useInventoryItem(productId: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_PRODUCTS, companyId, productId],
    queryFn: () => inventoryService.getProductStock(companyId, productId),
    enabled: !!companyId && !!productId,
  });
}

export function useStockMovements(filters?: InventoryFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_MOVEMENTS, companyId, filters],
    queryFn: () => inventoryService.listMovements(companyId, filters),
    enabled: !!companyId,
  });
}

export function useInventoryLots(productId?: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_LOTS, companyId, productId],
    queryFn: () => inventoryService.listLots(companyId, productId),
    enabled: !!companyId,
  });
}

export function useWarehouses() {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_WAREHOUSES, companyId],
    queryFn: () => inventoryService.listWarehouses(companyId),
    enabled: !!companyId,
  });
}

export function useLocations(warehouseId?: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK_LOCATIONS, companyId, warehouseId],
    queryFn: () => inventoryService.listLocations(companyId, warehouseId),
    enabled: !!companyId,
  });
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QK_PRODUCTS] });
    queryClient.invalidateQueries({ queryKey: [QK_MOVEMENTS] });
    queryClient.invalidateQueries({ queryKey: [QK_DASHBOARD] });
  };

  const executeTransfer = useMutation({
    mutationFn: (dto: TransferRequest) => inventoryService.executeTransfer(companyId, dto),
    onSuccess: invalidate,
  });

  const executeAdjustment = useMutation({
    mutationFn: (dto: AdjustmentRequest) => inventoryService.executeAdjustment(companyId, dto),
    onSuccess: invalidate,
  });

  return {
    executeTransfer,
    executeAdjustment,
    isMutating: executeTransfer.isPending || executeAdjustment.isPending,
  };
}
