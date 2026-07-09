import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseService } from '@/lib/services/purchase.service';
import { CreatePurchaseOrderDto, PurchaseFilters, ReceiveItemDto } from '@/types/purchases';
import { useAuthStore } from '@/store/authStore';

const QK = 'purchase-orders';

export function usePurchases(filters?: PurchaseFilters) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK, companyId, filters],
    queryFn: () => purchaseService.list(companyId, filters),
    enabled: !!companyId,
  });
}

export function usePurchase(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK, companyId, id],
    queryFn: () => purchaseService.getById(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function usePurchaseTimeline(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK, 'timeline', companyId, id],
    queryFn: () => purchaseService.getTimeline(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function usePurchaseQuotations(id: string) {
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  return useQuery({
    queryKey: [QK, 'quotations', companyId, id],
    queryFn: () => purchaseService.getQuotations(companyId, id),
    enabled: !!companyId && !!id,
  });
}

export function usePurchaseMutations() {
  const queryClient = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId || '');
  const invalidate = () => queryClient.invalidateQueries({ queryKey: [QK] });

  const createOrder = useMutation({
    mutationFn: (dto: CreatePurchaseOrderDto) => purchaseService.create(companyId, dto),
    onSuccess: invalidate,
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreatePurchaseOrderDto> }) =>
      purchaseService.update(companyId, id, dto),
    onSuccess: invalidate,
  });

  const cancelOrder = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      purchaseService.cancel(companyId, id, reason),
    onSuccess: invalidate,
  });

  const approveOrder = useMutation({
    mutationFn: (id: string) => purchaseService.approve(companyId, id),
    onSuccess: invalidate,
  });

  const receivePartial = useMutation({
    mutationFn: ({ id, items }: { id: string; items: ReceiveItemDto[] }) =>
      purchaseService.receivePartial(companyId, id, items),
    onSuccess: invalidate,
  });

  const receiveAll = useMutation({
    mutationFn: (id: string) => purchaseService.receiveAll(companyId, id),
    onSuccess: invalidate,
  });

  return {
    createOrder,
    updateOrder,
    cancelOrder,
    approveOrder,
    receivePartial,
    receiveAll,
    isMutating:
      createOrder.isPending || updateOrder.isPending || cancelOrder.isPending ||
      approveOrder.isPending || receivePartial.isPending || receiveAll.isPending,
  };
}
